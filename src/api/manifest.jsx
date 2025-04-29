import { supabase } from "../supabaseClient";
import { GoogleGenAI } from "@google/genai";
import * as XLSX from "xlsx";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_KEY });

const extractCityProvinceRegion = async (addresses) => {
  const prompt = `You are an address parser. For each address below, extract the **City**, **Province**, and **Region** in the Philippines. 
Respond with a JSON array of strings where each entry is formatted exactly like: "City, Province, Region".

🟡 Important:
- If the city is part of Metro Manila, use "Metro Manila" as the province.
- Ensure all three parts (City, Province, Region) are present.
- Do not return null, empty values, or "Unknown".
- Maintain the same index order as the input list.
- Only return the JSON array. Do not include explanations or code block formatting.

  Addresses:
  ${addresses.map((addr, i) => `${i + 1}. ${addr}`).join("\n")}
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  let text = response.text || "";
  console.log("Raw response:", text);

  const match = text.match(/\[([\s\S]*?)\]/);
  const jsonArrayText = match ? `[${match[1]}]` : null;

  if (!jsonArrayText) {
    console.error("No array found in response.");
    return [];
  }

  try {
    const parsed = JSON.parse(jsonArrayText);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Failed to parse JSON array:", jsonArrayText);
    return [];
  }
};

export const uploadManifest = async (manifestData) => {
  try {
    const {
      shipmentNo,
      containerNo,
      totalBoxes,
      manifestData: rows,
    } = manifestData;

    if (!Array.isArray(rows) || rows.length === 0) {
      throw new Error("No valid data provided.");
    }

    const { data: existingShipment, error: shipmentError } = await supabase
      .from("shipments")
      .select("shipment_id")
      .eq("shipment_number", shipmentNo)
      .single();

    if (shipmentError && shipmentError.code !== "PGRST116") throw shipmentError;

    let shipmentId = existingShipment?.shipment_id;

    if (!shipmentId) {
      const { data: insertedShipment, error: insertError } = await supabase
        .from("shipments")
        .insert({
          shipment_number: shipmentNo,
          container_number: containerNo,
          total_boxes: parseInt(totalBoxes),
        })
        .select("shipment_id")
        .single();

      if (insertError) throw insertError;
      shipmentId = insertedShipment.shipment_id;
    }

    const consigneeAddresses = rows.map((row) => row["CONSIGNEE_ADDRESS"]);

    const cityProvinceRegionList = await extractCityProvinceRegion(
      consigneeAddresses
    );

    if (cityProvinceRegionList.length === 0) {
      throw new Error("Something went wrong. Please try again");
    }

    const deliveryRows = rows.map((row, index) => {
      const [city, province, region] =
        cityProvinceRegionList[index]?.split(",").map((s) => s.trim()) || [];

      return {
        shipment_id: shipmentId,
        tracking_number: row["TRACKING NO."],
        qty: parseInt(row["NO. OF BOXES"]),
        barcode_no: row["BARCODE"],
        agent: row["AGENT"],
        shipper_name: row["NAME OF SENDER"],
        shipper_ctc: row["CONTACT NO."],
        consignee: row["CONSIGNEE"],
        consignee_address: row["CONSIGNEE_ADDRESS"],
        consignee_ctc: row["CONTACT NO._1"],
        destination: row["DESTINATION"],
        city,
        province,
        region,
        status: null,
      };
    });

    const { error: insertError } = await supabase
      .from("deliveries")
      .insert(deliveryRows);

    if (insertError) throw insertError;

    return { success: true };
  } catch (error) {
    throw new Error(error.message);``
  }
};

export const getRecentManifest = async () => {
  try {
    const { data, error } = await supabase
      .from("shipments")
      .select("shipment_number")
      .order("shipment_number", { ascending: false });

    if (error) {
      console.error("Error fetching shipments:", error);
      return [];
    }
    
    return data.map(item => item.shipment_number);
  } catch (error) {
    throw new Error(error.message);
  }
};


export const getDeliveries = async (filters = {}, page = 1, rowLimit = 5) => {
  try {
    let query = supabase
      .from("deliveries")
      .select("*, shipments!inner(*)", { count: "exact" })
      .range((page - 1) * rowLimit, page * rowLimit - 1);

    if (filters.shipment_number) {
      query = query.eq("shipments.shipment_number", filters.shipment_number);
    }

    if (filters.status && filters.status !== "ALL") {
      query = query.eq("status", filters.status);
    }

    const { data, error, count } = await query;

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
    if (!query || !query.trim()) {
      throw new Error("Search query cannot be empty");
    }

    const { data: initial, error: initialError } = await supabase
      .from("deliveries")
      .select(
        `
        *,
        shipments (
          shipment_number,
          container_number
        )
      `
      )
      .or(
        `shipper_name.ilike.%${query}%,tracking_number.ilike.%${query}%,barcode_no.ilike.%${query}%,consignee.ilike.%${query}%`
      )
      .limit(1);

    if (initialError) throw initialError;

    if (!initial || initial.length === 0) {
      return { searchResult: [], searchFound: false };
    }

    const match = initial[0];

    const { data: relatedMatches, error: relatedError } = await supabase
      .from("deliveries")
      .select(
        `
          *,
          shipments (
            shipment_number,
            container_number
          )
        `
      )
      .neq("delivery_id", match.delivery_id)
      .or(
        `shipper_name.ilike.${match.shipper_name},consignee.ilike.${match.consignee}`
      );

    if (relatedError) {
      return { searchResult: [], searchFound: false };
    }
    const results = [match, ...(relatedMatches || [])];

    return {
      searchResult: results,
      searchFound: results.length > 0,
    };
  } catch (error) {
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
      const { data: newShipment, error: insertError } = await supabase
        .from("shipments")
        .insert({
          shipment_number: shipmentNumber,
          container_number: containerNumber,
          total_boxes: totalBoxes,
        })
        .select("shipment_id")
        .single();

      if (insertError) throw insertError;
      shipmentId = newShipment.shipment_id;
    }

    const { error: deliveryError } = await supabase.from("deliveries").insert({
      ...deliveryData,
      shipment_id: shipmentId,
    });

    if (deliveryError) throw deliveryError;

    return { success: "Delivery created successfully" };
  } catch (error) {
    console.error(error);
    return { error: error.message };
  }
};

export const updateDelivery = async (deliveryId, updatedFields) => {
  try {
    const { data, error } = await supabase
      .from("deliveries")
      .update(updatedFields)
      .eq("delivery_id", parseInt(deliveryId));

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

export const exportToExcel = async (shipmentNumber) => {
  try {
    const { data, error } = await supabase
      .from("deliveries")
      .select("*, shipments!inner(*)", { count: "exact" })
      .eq("shipments.shipment_number", shipmentNumber);

    if (error) throw error;
    if (!data) throw new Error("No delivery data found.");

    const wb = XLSX.utils.book_new();

    const regionMap = {
      LUZ: "Luzon",
      VIS: "Visayas",
      NCR: "NCR",
      MIN: "Mindanao",
    };

    const provinces = {};
    const regionSummary = {};
    const allRegionSummaryRows = [];

    data.forEach((item) => {
      const region = regionMap[item.destination] || "Other";
      const isMetroManila = item.province === "Metro Manila";
      const sheetKey = isMetroManila ? item.city : item.province;

      if (!provinces[sheetKey]) provinces[sheetKey] = [];
      provinces[sheetKey].push(item);

      if (!regionSummary[region]) regionSummary[region] = {};
      if (!regionSummary[region][sheetKey]) {
        regionSummary[region][sheetKey] = {
          Boxes: 0,
          Delivered: 0,
          Total: 0,
        };
      }

      regionSummary[region][sheetKey].Boxes += item.qty;
      regionSummary[region][sheetKey].Delivered += item.status ? 1 : 0;
      regionSummary[region][sheetKey].Total += 1;
    });

    // ✅ Combined Summary Sheet
    let grandTotal = { Region: "Grand Total", Boxes: 0, Delivered: 0, Total: 0 };
    Object.entries(regionSummary).forEach(([region, provinceData]) => {
      allRegionSummaryRows.push([{ Region: region }]); // Region header row
      const rows = Object.entries(provinceData).map(([place, summary]) => ({
        Region: "",
        Province: place,
        ...summary,
      }));

      const total = rows.reduce(
        (acc, row) => {
          acc.Boxes += row.Boxes;
          acc.Delivered += row.Delivered;
          acc.Total += row.Total;
          return acc;
        },
        { Region: "", Province: "Subtotal", Boxes: 0, Delivered: 0, Total: 0 }
      );

      rows.push(total);

      // Update grand total
      grandTotal.Boxes += total.Boxes;
      grandTotal.Delivered += total.Delivered;
      grandTotal.Total += total.Total;

      allRegionSummaryRows.push(...rows, [{}]); // section + gap
    });

    allRegionSummaryRows.push([grandTotal]);
    const flattenedSummary = allRegionSummaryRows.flat();
    const wsSummary = XLSX.utils.json_to_sheet(flattenedSummary);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

    // ✅ Province/City Sheets
    Object.entries(provinces).forEach(([sheetName, rows]) => {
      const formattedRows = rows.map((r) => ({
        "SHIPMENT NO.": r.shipments?.shipment_number,
        "CONTAINER NO.": r.shipments?.container_number,
        "TRACKING NO.": r.tracking_number || "",
        "NAME OF SENDER": r.shipper_name,
        "CONTACT NO.": r.shipper_ctc,
        AGENT: r.agent,
        CONSIGNEE: r.consignee,
        CONSIGNEE_ADDRESS: r.consignee_address,
        "CONTACT NO.": r.consignee_ctc,
        BARCODE: r.barcode_no,
        DESTINATION: r.destination,
        "NO. OF BOXES": r.qty,
      }));

      const ws = XLSX.utils.json_to_sheet(formattedRows);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });

    XLSX.writeFile(wb, `ManifestExport_${shipmentNumber}.xlsx`);
  } catch (error) {
    console.error("Excel Export Error:", error.message);
  }
};
