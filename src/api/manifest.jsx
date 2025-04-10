import { supabase } from "../supabaseClient";

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

    const deliveryRows = rows.map((row) => ({
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
      status: null,
    }));

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
