import * as XLSX from "xlsx";
import { uploadManifest, updateDeliveryBoxesByExcel } from "../api/manifest";
import { ALLOWED_DELIMITERS_REGEX, splitBarcodes } from "./helper";

export const getSheetNames = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        resolve(workbook.SheetNames);
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsArrayBuffer(file);
  });
};

export const readSheet = (file, sheetName) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        if (!workbook.SheetNames.includes(sheetName)) {
          reject(new Error(`Sheet "${sheetName}" not found in the uploaded excel file. Please check it first.`));
          return;
        }

        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });
        resolve(json);
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsArrayBuffer(file);
  });
};

const buildDeliveryBoxes = (row, rowIndex) => {
  const  rawBarcodes = String(row["BARCODE NO."]).trim();
  const expectedQty = Number(row["NO. OF BOXES"]);

  if (!rawBarcodes) {
    return Array.from({ length: expectedQty }, () => ({
      barcode: "NO BARCODE FOUND",
      ...("STATUS" in row ? { status: row["STATUS"] ?? null } : {})
    }));
  }

  const isSingleBarcode = !/[;,\/]/.test(rawBarcodes);
  const hasValidDelimiter = ALLOWED_DELIMITERS_REGEX.test(rawBarcodes);

  if (!isSingleBarcode && !hasValidDelimiter) {
    throw new Error(
      `Row ${rowIndex + 1} (${row["TRACKING NO."]}): 
      BARCODE NO. must be separated using comma (,), semicolon (;), or slash (/). 
      Please use either of those characters when separating barcodes.`
    );
  }

  const barcodes = splitBarcodes(rawBarcodes);

  if (barcodes.length !== expectedQty) {
    const missingCount = expectedQty - barcodes.length;
    const filledBarcodes = [
      ...barcodes,
      ...Array.from({ length: missingCount }, () => "NO BARCODE FOUND")
    ];

    return filledBarcodes.map(barcode => ({
      barcode,
      ...("STATUS" in row ? { status: row["STATUS"] ?? null } : {})
    }));
  }

  const hasStatusColumn = "STATUS" in row;

  return barcodes.map(barcode => ({
    barcode,
    ...(hasStatusColumn ? { status: row["STATUS"] ?? null } : {})
  }));
};

export const processSheet = async (
  setLoading,
  file,
  selectedSheet,
  overrides = {},
  mode = "insert",
  showModal,
  toast
) => {
  try {
    const excelData = await readSheet(file, selectedSheet);

    if (!excelData || excelData.length === 0) {
      throw new Error("Excel sheet is empty.");
    }

    const firstRow = excelData[0];
    const shipmentNo = overrides.shipmentNo || firstRow["SHIPMENT NO."] || "";
    const containerNo = overrides.containerNo || firstRow["CONTAINER NO."] || "";

    const totalRow = excelData.find(
      (row) =>
        row["DESTINATION"] &&
        String(row["DESTINATION"]).toUpperCase().includes("TOTAL")
    );

    const totalBoxes = totalRow ? totalRow["NO. OF BOXES"] || "" : "";

    const manifestData = excelData.filter((row) => {
      const nonEmptyValues = Object.values(row).filter(
        (v) => v !== null && v !== undefined && String(v).trim() !== ""
      );
      return nonEmptyValues.length > 2;
    });

    if (manifestData.length === 0) {
      throw new Error("All rows are empty or invalid after cleaning.");
    }

    if (shipmentNo && containerNo) {
      const structuredManifest = [];
      for (let index = 0; index < manifestData.length; index++) {
        const row = manifestData[index];
        try {
          const delivery_boxes = buildDeliveryBoxes(row, index);
          structuredManifest.push({ ...row, __delivery_boxes: delivery_boxes });
        } catch (rowError) {
          return {
            data: { manifestData: [row] },
            success: false,
            message: rowError.message,
          };
        }
      }

      const payload = {
        shipmentNo,
        containerNo,
        totalBoxes,
        manifestData: structuredManifest,
      };

      let result
      if (mode === "insert") {
        // Normal upload
        result = await uploadManifest(payload);
      } else if (mode === "reconcile") {
        // Reconciliation mode
        result = await updateDeliveryBoxesByExcel(payload.manifestData, shipmentNo, showModal, toast);
      }

      if (!result.success) throw new Error("Something went wrong.");

      return { data: payload, success: true, message: null }
    } else {
      return {
        success: false,
        message: "Missing shipment/container",
        requiresInput: true,
      };
    }
  } catch (err) {
    return { data: null, success: false, message: err?.message }
  } finally {
    setLoading(false);
  }
};



