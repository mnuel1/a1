import * as XLSX from "xlsx";
import { uploadManifest } from "../api/manifest";
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
  const rawBarcodes = String(row["BARCODE NO."]).trim();
  const expectedQty = Number(row["NO. OF BOXES"]);

  if (!rawBarcodes) {
    throw new Error(
      `Row ${rowIndex + 1}: BARCODE NO. is empty`
    );
  }

  const isSingleBarcode = !/[;,\/]/.test(rawBarcodes);
  const hasValidDelimiter = ALLOWED_DELIMITERS_REGEX.test(rawBarcodes);

  if (!isSingleBarcode && !hasValidDelimiter) {
    throw new Error(
      `Row ${rowIndex + 1} (${row["TRACKING NO."]}): 
      BARCODE NO. must be separated using comma (,), semicolon (;), or slash (/). 
      Please use either of those characters when seperating barcodes.`
    );
  }
  const barcodes = splitBarcodes(rawBarcodes);

  if (barcodes.length !== expectedQty) {
    throw new Error(
      `(${barcodes.length}) barcodes detected but it is not match with the number of boxes (${expectedQty}). Please check and correct the manifest before uploading it again.`
    );
  }
  const hasStatusColumn = "STATUS" in row;

  return barcodes.map(barcode => ({
    barcode,
    ...(hasStatusColumn ? { status: row["STATUS"] ?? null } : {})
  }));
};

export const processSheet = async (setLoading, file, selectedSheet) => {
  try {
    const excelData = await readSheet(file, selectedSheet);

    if (!excelData || excelData.length === 0) {
      throw new Error("Excel sheet is empty.");
    }

    const firstRow = excelData[0];
    const shipmentNo = firstRow["SHIPMENT NO."] || "";
    const containerNo = firstRow["CONTAINER NO."] || "";


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

        console.log(payload);

        const result = await uploadManifest(payload);

        if (!result.success) throw new Error("Something went wrong.");

        return { data: payload, success: true, message: null }
      } else {
        throw new Error("We detected that the sheet does not contain either a shipment number or a container number. Please double-check the manifest before uploading.");
      }
    } catch (err) {
      return { data: null, success: false, message: err?.message }
    } finally {
      setLoading(false);
    }
  };