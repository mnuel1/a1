import { supabase } from "../supabaseClient";

export const getAnalytics = async (shipmentNumber) => {
  try {
    const { data, error } = await supabase
      .from("deliveries")
      .select("region, destination, qty")
      .eq("shipment_id", 22);

    if (error) throw error;

    const groupedDestinations = data.reduce((acc, curr) => {
      const dest = curr.destination;
      const qty = parseInt(curr.qty) || 0;
      acc[dest] = (acc[dest] || 0) + qty;
      return acc;
    }, {});

    const destinations = Object.entries(groupedDestinations).map(
      ([destination, totalQty]) => ({
        destination,
        totalQty,
      })
    );
    
    const groupedRegions = data.reduce((acc, curr) => {
      const region = curr.region;
      const qty = parseInt(curr.qty) || 0;
      if (!region) return acc;
      acc[region] = (acc[region] || 0) + qty;
      return acc;
    }, {});

    const regions = Object.entries(groupedRegions).map(
      ([region, value]) => ({
        group: region,
        value,
      })
    );
    
    return {
      destinations,
      regions,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};
