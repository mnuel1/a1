import { supabase, supaClient } from "../supabaseClient";
import * as XLSX from "xlsx"

export const uploadManifest = async (manifestData) => {
  try {
    const {
      shipmentNo,
      containerNo,
      totalBoxes,
      manifestData: rows,
    } = manifestData;

    if (!rows || rows.length === 0) {
      throw new Error("Excel sheet is empty.");
    }

    const { data: existingShipment, error: shipmentError } = await supabase
      .from("shipments")
      .select("shipment_id")
      .eq("shipment_number", shipmentNo)
      .single();

    if (shipmentError && shipmentError.code !== "PGRST116") throw shipmentError;

    let shipmentId = existingShipment?.shipment_id;

    if (!shipmentId) {
      const { data: insertedShipment, error: insertErr } = await supaClient.insert(
        "shipments",
        {
          shipment_number: shipmentNo,
          container_number: containerNo,
          total_boxes: parseInt(totalBoxes),
        },
        "shipment_id",
        true
      );

      if (insertErr) throw insertErr;
      shipmentId = insertedShipment.shipment_id;
    }

    const deliveryRows = rows.map((row) => {
      return {
        shipment_id: shipmentId,
        tracking_number: row["TRACKING NO."],
        qty: parseInt(row["NO. OF BOXES"]),
        agent: row["AGENT"],
        shipper_name: row["NAME OF SENDER"],
        shipper_ctc: row["CONTACT NO."],
        consignee: row["CONSIGNEE"],
        consignee_address: row["CONSIGNEE_ADDRESS"],
        consignee_ctc: row["CONTACT NO._1"],
        destination: row["DESTINATION"],
        city: row["CITY"],
      };
    });

    console.log(deliveryRows)
    const { data: insertedDeliveries, error: insertErr } = await supaClient.insert("deliveries", deliveryRows, "*");
    if (insertErr) throw insertErr;

    // 2️⃣ Prepare boxes
    const boxRows = [];

    insertedDeliveries.forEach((delivery, index) => {
      const boxes = rows[index]["__delivery_boxes"] || [];
      boxes.forEach((box) => {
        boxRows.push({
          delivery_id: delivery.delivery_id,
          barcode: box.barcode,
          status: "NONE",
        });
      });
    });

    // 3️⃣ Insert boxes
    if (boxRows.length > 0) {
      const { error: boxInsertErr } = await supaClient
        .insert("delivery_boxes", boxRows)

      if (boxInsertErr) throw boxInsertErr;
    }

    return { success: true };
  } catch (error) {
    throw new Error(error.message); ``
  }
};

/**
 * update delivery boxes from Excel vs DB
 * @param {Array} rows - Excel rows with __delivery_boxes
 */
export const updateDeliveryBoxesByExcel = async (rows, shipmentNo, showModal, toast) => {
  try {
    if (!rows || rows.length === 0) return;

    // ─── 1. Fetch deliveries matching tracking numbers + shipment ─────────────
    const trackingNumbers = rows.map(r => r["TRACKING NO."]);

    const { data: deliveries, error: deliveryErr } = await supabase
      .from("deliveries")
      .select(`
        delivery_id,
        tracking_number,
        shipments!inner (shipment_number)
      `)
      .in("tracking_number", trackingNumbers)
      .eq("shipments.shipment_number", shipmentNo);

    if (deliveryErr) throw deliveryErr;
    if (!deliveries || deliveries.length === 0) throw new Error("No delivery record found");

    const deliveryMap = Object.fromEntries(deliveries.map(d => [d.tracking_number, d.delivery_id]));
    const deliveryIds = deliveries.map(d => d.delivery_id);

    // ─── 2. Fetch all existing boxes for these deliveries ─────────────────────
    const { data: existingBoxes, error: boxErr } = await supabase
      .from("delivery_boxes")
      .select("delivery_id, barcode, status")
      .in("delivery_id", deliveryIds);

    if (boxErr) throw boxErr;

    // Group existing boxes by delivery_id
    const deliveryBoxMap = {};
    existingBoxes.forEach(b => {
      if (!deliveryBoxMap[b.delivery_id]) deliveryBoxMap[b.delivery_id] = [];
      deliveryBoxMap[b.delivery_id].push(b);
    });

    // ─── 3. Loop rows — collect actions ──────────────────────────────────────
    const extraBoxes = [];          // Excel boxes not in DB → auto-insert
    const missingDiscrepancies = []; // DB has more boxes than Excel → prompt
    const statusDiscrepancies = [];  // Status mismatch at same index → prompt

    const existingBarcodeSet = new Set(existingBoxes.map(b => `${b.delivery_id}-${b.barcode}`));

    for (const row of rows) {
      const deliveryId = deliveryMap[row["TRACKING NO."]];
      if (!deliveryId) continue;

      const excelBoxes = row.__delivery_boxes || [];
      const dbBoxes = deliveryBoxMap[deliveryId] || [];
      const minLen = Math.min(dbBoxes.length, excelBoxes.length);

      // ── 3a. Auto-rename barcodes at same index (no modal) ──────────────────
      for (let i = 0; i < minLen; i++) {
        const dbBox = dbBoxes[i];
        const excelBox = excelBoxes[i];

        if (dbBox.barcode !== excelBox.barcode) {
          const { error } = await supabase
            .from("delivery_boxes")
            .update({ barcode: excelBox.barcode })
            .eq("delivery_id", deliveryId)
            .eq("barcode", dbBox.barcode);

          if (error) throw error;

          // Keep existingBarcodeSet in sync so extra-box check stays accurate
          existingBarcodeSet.delete(`${deliveryId}-${dbBox.barcode}`);
          existingBarcodeSet.add(`${deliveryId}-${excelBox.barcode}`);
          dbBox.barcode = excelBox.barcode; // update local ref for status check below
        }
      }

      // ── 3b. Collect extra boxes (Excel has more than DB) ───────────────────
      excelBoxes.forEach(b => {
        const key = `${deliveryId}-${b.barcode}`;
        if (!existingBarcodeSet.has(key)) {
          extraBoxes.push({
            delivery_id: deliveryId,
            barcode: b.barcode,
            status: b.status?.toUpperCase() || "PENDING"
          });
          existingBarcodeSet.add(key);
        }
      });

      // ── 3c. Collect missing boxes discrepancy (DB has more than Excel) ──────
      if (dbBoxes.length > excelBoxes.length) {
        missingDiscrepancies.push({
          delivery_id: deliveryId,
          tracking_number: row["TRACKING NO."],
          dbCount: dbBoxes.length,
          excelCount: excelBoxes.length,
          difference: dbBoxes.length - excelBoxes.length,
          excelBoxes,
        });
      }

      // ── 3d. Collect status discrepancies at same index ─────────────────────
      const statusMismatches = [];
      for (let i = 0; i < minLen; i++) {
        const dbBox = dbBoxes[i];
        const excelStatus = excelBoxes[i].status?.trim()?.toUpperCase() || null;
        if (excelStatus && dbBox.status?.toUpperCase() !== excelStatus) {
          statusMismatches.push({
            "Shipment No.": shipmentNo,
            "Tracking No.": row["TRACKING NO."],
            "Barcode": dbBox.barcode,
            "Old Box/s Status": dbBox.status,
            "New Excel Box/s Status": excelStatus,
            // Internal refs for update (not shown as columns)
            __deliveryId: deliveryId,
            __newStatus: excelStatus,
          });
        }
      }

      if (statusMismatches.length > 0) {
        statusDiscrepancies.push(...statusMismatches);
      }
    }

    // ─── 4. Auto-insert extra boxes + notify ─────────────────────────────────
    if (extraBoxes.length > 0) {
      const { error: insertErr } = await supabase
        .from("delivery_boxes")
        .insert(extraBoxes);

      if (insertErr) throw insertErr;

      await new Promise(resolve => {
        showModal({
          title: "Extra Boxes Added",
          sub: "These boxes were not in the DB and have been added.",
          type: "table",
          data: extraBoxes.map(b => ({
            "Delivery ID": b.delivery_id,
            "Barcode": b.barcode,
            "Status": b.status
          })),
          confirmText: "OK",
          showCancel: false,
          onConfirm: resolve,
        });
      });
    }

    // ─── 5. Missing boxes — selectable modal (per row = per tracking number) ──
    if (missingDiscrepancies.length > 0) {
      await new Promise(resolve => {
        showModal({
          title: "Missing Boxes Detected",
          sub: "Select which deliveries to replace with Excel data. Deselected rows will be skipped.",
          type: "selectable-table",
          data: missingDiscrepancies.map(d => ({
            "Tracking No.": d.tracking_number,
            "Old Box/s Count": d.dbCount,
            "New Excel Box/s Count": d.excelCount,
            "Difference": d.difference,
            // Hidden ref
            __raw: d,
          })),
          onConfirm: async (selectedRows) => {
            for (const row of selectedRows) {
              const d = row.__raw;
              await supabase
                .from("delivery_boxes")
                .delete()
                .eq("delivery_id", d.delivery_id);

              await supabase
                .from("delivery_boxes")
                .insert(d.excelBoxes.map(b => ({
                  delivery_id: d.delivery_id,
                  barcode: b.barcode,
                  status: b.status?.toUpperCase() || "PENDING"
                })));
            }
            resolve();
          },
          onCancel: resolve,
        });
      });
    }

    // ─── 6. Status discrepancies — selectable modal (all mismatches at once) ──
    if (statusDiscrepancies.length > 0) {
      // Strip internal refs from display data
      const displayData = statusDiscrepancies.map(({ __deliveryId, __newStatus, ...visible }) => visible);

      await new Promise(resolve => {
        showModal({
          title: "Status Discrepancy Detected",
          sub: "Select which boxes to update. Deselected rows will be skipped.",
          type: "selectable-table",
          data: displayData,
          onConfirm: async (selectedRows) => {
            for (const row of selectedRows) {
              // Match back to internal ref by index
              const internal = statusDiscrepancies[displayData.indexOf(row)];
              await supabase
                .from("delivery_boxes")
                .update({ status: internal.__newStatus })
                .eq("delivery_id", internal.__deliveryId)
                .eq("barcode", internal.Barcode);
            }
            resolve();
          },
          onCancel: resolve,
        });
      });
    }

    toast.success("Delivery boxes reconciliation completed successfully!");
    return { success: true };

  } catch (err) {
    console.error(err);
    toast.error(err.message || "Error reconciling delivery boxes");
    return { success: false };
  }
};

export const compareExcelWithDB = async (rows, shipmentNo) => {
  try {
    if (!rows || rows.length === 0) return { discrepancies: [] };

    // 1. Get deliveries and their boxes for this shipment
    const trackingNumbers = rows.map(r => r["TRACKING NO."]);

    const { data: deliveries, error } = await supabase
      .from("deliveries")
      .select(`
        delivery_id,
        tracking_number,
        delivery_boxes!inner (barcode, status),
        shipments!inner (shipment_number)
      `)
      .in("tracking_number", trackingNumbers)
      .eq("shipments.shipment_number", shipmentNo);

    if (error) throw error;
    if (!deliveries || deliveries.length === 0) return { discrepancies: [] };

    const discrepancies = [];

    // 2. Compare Excel boxes with DB boxes
    const deliveryMap = Object.fromEntries(
      deliveries.map(d => [d.tracking_number, d.delivery_boxes])
    );

    for (const row of rows) {
      const excelBoxes = row.__delivery_boxes || [];
      const dbBoxes = deliveryMap[row["TRACKING NO."]] || [];

      const minLen = Math.min(excelBoxes.length, dbBoxes.length);

      // Check mismatched barcodes at same index
      for (let i = 0; i < minLen; i++) {
        if (excelBoxes[i].barcode !== dbBoxes[i].barcode) {
          discrepancies.push({
            type: "barcode_mismatch",
            "Tracking No.": row["TRACKING NO."],
            index: i + 1,
            "DB Barcode": dbBoxes[i].barcode,
            "Excel Barcode": excelBoxes[i].barcode,
          });
        }

        const excelStatus = excelBoxes[i].status?.toUpperCase() || null;
        const dbStatus = dbBoxes[i].status?.toUpperCase() || null;
        if (excelStatus && dbStatus !== excelStatus) {
          discrepancies.push({
            type: "status_mismatch",
            "Tracking No.": row["TRACKING NO."],
            index: i + 1,
            "DB Status": dbStatus,
            "Excel Status": excelStatus,
          });
        }
      }

      // Check for extra boxes in Excel
      if (excelBoxes.length > dbBoxes.length) {
        discrepancies.push({
          type: "extra_in_excel",
          "Tracking No.": row["TRACKING NO."],
          extraCount: excelBoxes.length - dbBoxes.length,
          extraBoxes: excelBoxes.slice(dbBoxes.length),
        });
      }

      // Check for missing boxes in Excel (DB has more)
      if (dbBoxes.length > excelBoxes.length) {
        discrepancies.push({
          type: "missing_in_excel",
          "Tracking No.": row["TRACKING NO."],
          missingCount: dbBoxes.length - excelBoxes.length,
          missingBoxes: dbBoxes.slice(excelBoxes.length),
        });
      }
    }

    return { discrepancies };
  } catch (err) {
    console.error(err);
    return { discrepancies: [], error: err.message };
  }
};

export const getRecentManifest = async () => {
  try {
    const { data, error } = await supabase
      .from("shipments")
      .select("shipment_number, container_number")
      .order("shipment_number", { ascending: false });

    if (error) {
      console.error("Error fetching shipments:", error);
      return [];
    }

    data.unshift({
      shipment_number: "All",
      container_number: ''
    });

    return data.map(item => ({
      shipment_number: item.shipment_number,
      container_number: item.container_number
    }));
  } catch (error) {
    throw new Error(error.message);
  }
};

