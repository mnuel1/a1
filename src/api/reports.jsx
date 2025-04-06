import { supabase } from "../supabaseClient";

export const getTotalBoxes = async (shipmentNo) => {
  try {
    const { data, error } = await supabase
      .from("deliveries")
      .select("destination, qty")
      // .eq("shipment_id", "8");

    if (error) throw error;

    // Group and sum qty by destination
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
