import { supabase } from "../supabaseClient";

/**
 * Get analytics per shipment
 * Returns:
 *  - destinations: total boxes + breakdown by status + cities
 *  - cities: top 6 cities by total boxes
 */
export const getAnalytics = async (shipmentNumber) => {
  try {
    // fetch boxes joined with deliveries and shipments
    const { data, error } = await supabase
      .from("delivery_boxes")
      .select(`
        delivery_id,
        status,
        deliveries!inner(
          city,
          destination,
          shipment_id,
          shipments!inner(shipment_number)
        )
      `)
      .eq("deliveries.shipments.shipment_number", shipmentNumber);

    if (error) throw error;

    const normalizeCity = (city) =>
      city ? city.replace(/city/i, "").trim() : "UNKNOWN";

    const destinationsMap = {};

    data.forEach((box) => {
      const dest = box.deliveries.destination?.trim() || "UNKNOWN";
      const status = box.status?.trim() || "NONE";
      const city = normalizeCity(box.deliveries.city);
      console.log(dest);

      if (dest === 'UNKNOWN') {
        console.log(box);
        
      }
      
      if (!destinationsMap[dest]) {
        destinationsMap[dest] = {
          destination: dest,
          totalBoxes: 0,
          statusBreakdown: {}, // boxes per status
          cities: {}, // boxes per city
        };
      }

      // total boxes per destination
      destinationsMap[dest].totalBoxes += 1;

      // per status
      destinationsMap[dest].statusBreakdown[status] =
        (destinationsMap[dest].statusBreakdown[status] || 0) + 1;

      // per city
      destinationsMap[dest].cities[city] =
        (destinationsMap[dest].cities[city] || 0) + 1;
    });

    const destinations = Object.values(destinationsMap);

    // top 6 cities across all destinations
    const citiesMap = {};
    destinations.forEach((d) => {
      Object.entries(d.cities).forEach(([city, count]) => {
        citiesMap[city] = (citiesMap[city] || 0) + count;
      });
    });

    let cities = Object.entries(citiesMap).map(([group, value]) => ({
      group,
      value,
    }));

    cities = cities
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    return { destinations, cities };
  } catch (error) {
    throw new Error(error.message);
  }
};
