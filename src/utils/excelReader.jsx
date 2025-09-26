import * as XLSX from "xlsx";
import { uploadManifest } from "../api/manifest";

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
          reject(new Error(`Sheet "${sheetName}" not found`));
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
      const payload = { manifestData: manifestData, shipmentNo, containerNo, totalBoxes };
      const result = await uploadManifest(payload);

      if (!result.success) throw new Error("Something went wrong.");

      return { data: payload, success: true, message: null}
    } else {
      throw new Error("Shipment number or container number not found.");
    }
  } catch (err) {
    return { data: null, success: false, message: err?.message}
  } finally {
    setLoading(false);
  }
};