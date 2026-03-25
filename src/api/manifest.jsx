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

    const { data: insertedDeliveries, error: insertErr } = await supaClient.insert("deliveries", deliveryRows, "*");
    if (insertErr) throw insertErr;

    console.log(insertedDeliveries);

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

    console.log(data);
    
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

export const getDeliveries = async (filters = {}, page = 1, rowLimit = 5, restrictions = {}) => {
  try {
    let query = supabase
      .from("deliveries")
      .select(`
        *, 
        shipments!inner(*),
        delivery_boxes!inner (
          box_id,
          barcode,
          status
        )`, { count: "exact" })
      .range((page - 1) * rowLimit, page * rowLimit - 1);
        
    if (filters.search && filters.search.trim() !== "") {
      const sanitized = filters.search.replace(/,/g, "");
      const search = `%${sanitized}%`;

      query = query.or(
        `tracking_number.ilike.${search},shipper_name.ilike.${search},consignee.ilike.${search}`
      );
    }

    if (
      filters.shipment_number &&
      filters.shipment_number.toLowerCase() !== "all"
    ) {
      query = query.eq("shipments.shipment_number", filters.shipment_number);
    }

    if (filters.status && filters.status !== "ALL") {
      query = query.eq("delivery_boxes.status", filters.status);
    }


    if (restrictions.region?.length) {
      const upperRegions = restrictions.region
        .filter(r => r && r.trim() !== "")
        .map(r => r.toUpperCase());

      if (upperRegions.length) {
        query = query.in("destination", upperRegions);
      }
    }

    if (restrictions.city?.length) {
      const normalizedCities = restrictions.city
        .filter(c => c && c.trim() !== "")
        .map(c => c.toLowerCase().replace(" city", "").trim());

      if (normalizedCities.length) {
        query = query.in(
          "city",
          normalizedCities.map(c => c.charAt(0).toUpperCase() + c.slice(1))
        );
      }
    }

    const { data, error, count } = await query;

    console.log(data, count);
    
    if (error) {
      console.error("Error fetching deliveries:", error);
      return { data: [], totalCount: 0 };
    }

    return { data, totalCount: count || 0 };
  } catch (error) {
    console.error("Unexpected error:", error.message);
    return { data: [], totalCount: 0 };
  }
};

export const searchDeliveries = async (query) => {
  try {
    if (!query?.trim()) throw new Error("Search query cannot be empty");

    const { data, error } = await supabase.rpc("search_deliveries", { query });

    if (error) throw error;

    if (!data || data.length === 0) {
      return { searchResult: [], searchFound: false };
    }

    const match = data[0];

    // simulate your "related matches" logic
    const relatedMatches = data.filter(d => d.delivery_id !== match.delivery_id);

    const results = [match, ...relatedMatches];

    return {
      searchResult: results,
      searchFound: results.length > 0,
    };
  } catch (error) {
    console.error(error);
    return { searchResult: [], searchFound: false };
  }
};

export const createDelivery = async (formData) => {
  try {
    const shipmentNumber = formData.shipment_number;
    const containerNumber = formData.container_number;
    const totalBoxes = parseInt(formData.total_boxes);

    const deliveryData = {
      tracking_number: formData.tracking_number,
      qty: parseInt(formData.qty),
      barcode_no: formData.barcode_no,
      agent: formData.agent,
      shipper_name: formData.shipper_name,
      shipper_ctc: formData.shipper_ctc,
      consignee: formData.consignee,
      consignee_address: formData.consignee_address,
      consignee_ctc: formData.consignee_ctc,
      destination: formData.destination,
      status: formData.status || null,
      date_out_for_delivery: formData.date_out_for_delivery || null,
      date_received: formData.date_received || null,
    };

    // Check if shipment exists
    const { data: existingShipment } = await supabase
      .from("shipments")
      .select("shipment_id")
      .or(
        `shipment_number.eq.${shipmentNumber},container_number.eq.${containerNumber}`
      )
      .limit(1)
      .single();

    let shipmentId = existingShipment?.shipment_id;

    if (!shipmentId) {
      const { data: newShipment } = await supaClient.insert(
        "shipments",
        {
          shipment_number: shipmentNumber,
          container_number: containerNumber,
          total_boxes: totalBoxes,
        },
        "shipment_id",
        true
      );

      shipmentId = newShipment.shipment_id;
    }

    await supaClient.insert("deliveries", {
      ...deliveryData,
      shipment_id: shipmentId,
    });

    return { success: "Delivery created successfully" };
  } catch (error) {
    console.error(error);
    return { error: error.message };
  }
};

export const updateDelivery = async (deliveryId, updatedFields) => {
  try {
    if (deliveryId === "delivery_boxes") {
      for (const updatedBox of updatedFields) {
        const { box_id, barcode, status } = updatedBox;

        const updatePayload = { box_id };
        if (barcode !== undefined && barcode !== null) updatePayload.barcode = barcode;
        if (status !== undefined && status !== null) updatePayload.status = status;

        const { data: boxData, error: boxError } = await supaClient.update(
          "delivery_boxes",
          { box_id: box_id },
          updatePayload,
          "*"
        )

        if (boxError) {
          console.error("Error updating box:", boxError);
        } else {
          console.log("Updated box:", boxData);
        }
      }
      return { success: true, message: `${deliveryId} updated successfully` };
    }

    console.log(updatedFields);

    const { data, error } = await supaClient.update(
      "deliveries",
      { delivery_id: deliveryId },
      updatedFields,
      "*"
    );

    if (error) throw error;

    if (!data || data.length === 0) {
      return { error: true, message: `${deliveryId} not found` };
    }

    return { success: true, message: `${deliveryId} updated successfully` };
  } catch (error) {
    console.error(error);
    return { error: error.message };
  }
};

export const exportToExcel = async (shipmentNumber, columns) => {
  try {
    const { data, error } = await supabase
      .from("deliveries")
      .select(`*, 
        shipments!inner(
          shipment_no:shipment_number,
          container_no:container_number,
          created_at,
          total_boxes
        ),
        delivery_boxes!inner(
          box_id,
          barcode,
          status
        )
      `, { count: "exact" })
      .eq("shipments.shipment_number", shipmentNumber);

    if (error) throw error;

    if (!data) throw new Error("No delivery data found.");

    const wb = XLSX.utils.book_new();
    const wbBarcode = XLSX.utils.book_new();

    const regionMap = {
      LUZON: "Luzon",
      VISAYAS: "Visayas",
      NCR: "NCR",
      MINDANAO: "Mindanao",
    };

    const cities = {};
    const regionSummary = {};
    const allRegionSummaryRows = [];

    data.forEach((item) => {
      const region = regionMap[item.destination] || "Other";

      let sheetKey = item.city?.trim().toLowerCase() || "Unknown";
      sheetKey = sheetKey.replace(/\s*city$/, "");
      sheetKey = sheetKey.charAt(0).toUpperCase() + sheetKey.slice(1);

      if (!cities[sheetKey]) cities[sheetKey] = [];
      cities[sheetKey].push(item);

      if (!regionSummary[region]) regionSummary[region] = {};
      if (!regionSummary[region][sheetKey]) {
        regionSummary[region][sheetKey] = {
          Boxes: 0,
          Delivered: 0,
        };
      }

      const boxes = item.delivery_boxes?.length || 0;
      const delivered = item.delivery_boxes?.filter(
        (b) => b.status === "DELIVERED"
      ).length || 0;

      regionSummary[region][sheetKey].Boxes += boxes;
      regionSummary[region][sheetKey].Delivered += delivered;
    });

    let grandTotal = { Region: "Grand Total", Boxes: 0, Delivered: 0 };
    Object.entries(regionSummary).forEach(([region, regionData]) => {
      allRegionSummaryRows.push([{ Region: region }]);
      const rows = Object.entries(regionData).map(([place, summary]) => ({
        Region: "",
        Province: place,
        ...summary,
      }));

      const total = rows.reduce(
        (acc, row) => {
          acc.Boxes += row.Boxes;
          acc.Delivered += row.Delivered;
          return acc;
        },
        { Region: "", Province: "Subtotal", Boxes: 0, Delivered: 0 }
      );

      rows.push(total);

      grandTotal.Boxes += total.Boxes;
      grandTotal.Delivered += total.Delivered;
      allRegionSummaryRows.push(...rows, [{}]);
    });

    allRegionSummaryRows.push([grandTotal]);

    const flattenedSummary = allRegionSummaryRows.flat();
    const wsSummary = XLSX.utils.json_to_sheet(flattenedSummary);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

    const scannableColumns = columns.filter((col) => col.displayFlags.scannable);
    const barcodeRows = data.flatMap((r) => {
      const scannableValues = scannableColumns.map((col) => {
        let value = r[col.key] || r[col.key] !== undefined ? r[col.key] : r.shipments?.[col.key];
        return value ?? "";
      });

      return Array.from({ length: r.qty || 1 }, () => ({
        DATA: scannableValues.join("\t"),
        BARCODE: r.barcode_no || "",
      }));
    });

    const wsBarcodes = XLSX.utils.json_to_sheet(barcodeRows);
    XLSX.utils.book_append_sheet(wbBarcode, wsBarcodes, "Barcodes");

    const getRowValue = (row, col) => {
      if (row[col.key] !== undefined) return row[col.key];
      if (row.shipments && col.key in row.shipments) return row.shipments[col.key];
      return "";
    };

    Object.entries(cities).forEach(([sheetName, rows]) => {
      const printableColumns = columns.filter((col) => col.displayFlags.printable);

      const formattedRows = rows.map((r) => {
        const rowObj = {};
        printableColumns.forEach((col) => {
          rowObj[col.label.toUpperCase()] = getRowValue(r, col);
        });
        return rowObj;
      });

      const ws = XLSX.utils.json_to_sheet(formattedRows);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });

    XLSX.writeFile(wb, `ManifestExport_${shipmentNumber}.xlsx`);
    XLSX.writeFile(wbBarcode, `Barcodes_${shipmentNumber}.xlsx`);

    // log it 
    await supaClient.export("deliveries")

    return true
  } catch (error) {
    console.error("Excel Export Error:", error.message);
    return false
  }
};

export const updateShipment = async ({
  id = null,
  shipment_number,
  container_number,
  qty,
  qtyUpd = true
}) => {

  if (!qtyUpd) {
    return supaClient.update(
      "shipments",
      { shipment_number: id },
      { shipment_number,  container_number },
      "*",
      true
    );

  }
  const { data: shipment, error } = await supaClient.select(
    "shipments",
    "*",
    { shipment_number, container_number },
    true
  );
  
  if (error || !shipment) return { error };

  const updatedTotal = shipment.total_boxes + qty;

  return supaClient.update(
    "shipments",
    { shipment_id: shipment.shipment_id },
    { total_boxes: updatedTotal },
    "*",
    true
  );
};

export const insertDeliveryBoxes = async (boxes) => {
  return supaClient.insert("delivery_boxes", boxes);
};
