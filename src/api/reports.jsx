import { supabase } from "../supabaseClient";

export const getTotalBoxes = async (shipmentNumber) => {
  try {
    const { data, error } = await supabase
      .from("deliveries")
      .select("destination, qty")
      // .eq("shipment_id", "8");

    if (error) throw error;
    
    const grouped = data.reduce((acc, curr) => {
      const dest = curr.destination;
      const qty = parseInt(curr.qty) || 0;

      acc[dest] = (acc[dest] || 0) + qty;
      return acc;
    }, {});

    const result = Object.entries(grouped).map(([destination, totalQty]) => ({
      destination,
      totalQty,
    }));

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const dissectByCity = async (shipmentNumber) => {

  try {
    const { data, error } = await supabase
      .from("deliveries")
      .select("*, shipments!inner(*)", { count: "exact" })
      .eq("shipments.shipment_number", shipmentNumber)      

    if (error) throw error;
    
    
  } catch (error) {
    throw new Error(error.message);
  }

}