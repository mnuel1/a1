import { supaClient } from "../../../supabaseClient";
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
      { shipment_number, container_number },
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
