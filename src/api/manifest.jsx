import { supabase } from "../supabaseClient";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_KEY });

const extractCityProvinceRegion = async (addresses) => {
  const prompt = `Extract the City, Province, and Region from the following addresses in the format: City, Province, Region. Return results as an array with the same index order as input. Only output the array.

  Addresses:
  ${addresses.map((addr, i) => `${i + 1}. ${addr}`).join("\n")}
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  let text = response.text || "";

  text = text.trim();
  if (text.startsWith("```")) {
    text = text.replace(/```(json)?/g, "").trim();
  }

  try {    
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Failed to parse AI response:", text);
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

    const consigneeAddresses = rows.map(row => row["CONSIGNEE_ADDRESS"]);

    const cityProvinceRegionList = await extractCityProvinceRegion(consigneeAddresses);
        
    const deliveryRows = rows.map((row, index) => {
      const [city, province, region] = cityProvinceRegionList[index]?.split(',').map(s => s.trim()) || [];

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
    throw new Error(error.message);
  }
};


export const getRecentManifest = async () => {
  try {
    const { data, error } = await supabase
      .from("shipments")
      .select("shipment_number")
      .order("shipment_number", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error("Error fetching shipment:", error);
      return null;
    }

    return data.shipment_number || null;
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
