import { supabase } from "../supabaseClient";

/**
 * Get analytics per shipment
 * Returns:
 *  - destinations: total boxes + breakdown by status + cities/regions
 *  - regions: total boxes per region
 */
export const getAnalytics = async (shipmentNumber) => {
  try {
    // fetch deliveries with shipment join
    const { data, error } = await supabase
      .from("deliveries")
      .select(`
        city,
        destination,
        qty,
        status,
        shipments!inner(shipment_number)
      `)
      .eq("shipments.shipment_number", shipmentNumber);

    if (error) throw error;

    const normalizeCity = (city) =>
      city ? city.replace(/city/i, "").trim() : "UNKNOWN";
    const destinationsMap = {};

    data.forEach((d) => {
      const dest = d.destination.trim() || "UNKNOWN";
      const status = d.status.trim() || "NONE";

      if (!destinationsMap[dest]) {
        destinationsMap[dest] = {
          destination: dest,
          totalQty: 0,
          statusBreakdown: {}, // boxes per status
          cities: {}, // boxes per city
        };
      }

      // total qty
      destinationsMap[dest].totalQty += parseInt(d.qty) || 0;

      // per status
      destinationsMap[dest].statusBreakdown[status] =
        (destinationsMap[dest].statusBreakdown[status] || 0) +
        (parseInt(d.qty) || 0);

    });

    const destinations = Object.values(destinationsMap);

    const citiesMap = {};
    data.forEach((d) => {
      const city = normalizeCity(d.city);
      citiesMap[city] = (citiesMap[city] || 0) + (parseInt(d.qty) || 0);
    });

    // Convert to array
    let cities = Object.entries(citiesMap).map(([group, value]) => ({
      group,
      value,
    }));

    // Keep only top 6 by value
    cities = cities
      .sort((a, b) => b.value - a.value) // descending
      .slice(0, 6);


    return { destinations, cities };
  } catch (error) {
    throw new Error(error.message);
  }
};
