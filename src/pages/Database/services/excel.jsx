import { supabase, supaClient} from "../../../supabaseClient";
import * as XLSX from "xlsx"

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
