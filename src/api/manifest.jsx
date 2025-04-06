import { supabase } from '../supabaseClient';

export const uploadManifest = async (manifestData) => {
  try {
    const { shipmentNo, containerNo, totalBoxes, manifestData: rows } = manifestData;

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
