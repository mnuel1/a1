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
    let query = supabase
      .from("delivery_boxes")
      .select(`
        delivery_id,
        status,
        deliveries!inner(
          destination,
          shipment_id,
          shipments!inner(shipment_number)
        )
      `)

    if (shipmentNumber && shipmentNumber !== "All") {
      query = query.eq("deliveries.shipments.shipment_number", shipmentNumber);
    }

    const { data, error } = await query;

    if (error) throw error;

    const destinationsMap = {};

    data.forEach((box) => {
      const dest = box.deliveries.destination?.trim() || "UNKNOWN";
      const status = box.status?.trim() || "NONE";

      if (!destinationsMap[dest]) {
        destinationsMap[dest] = {
          destination: dest,
          totalBoxes: 0,
          statusBreakdown: {} // boxes per status
        };
      }

      // total boxes per destination
      destinationsMap[dest].totalBoxes += 1;

      // per status
      destinationsMap[dest].statusBreakdown[status] =
        (destinationsMap[dest].statusBreakdown[status] || 0) + 1;
    });

    const destinations = Object.values(destinationsMap);

    const destinationSummary = Object.values(destinationsMap)
    .map(d => ({
      group: d.destination,
      value: d.totalBoxes,
      // statusBreakdown: d.statusBreakdown
    }))
    .sort((a, b) => b.value - a.value);

    return { destinations, destinationSummary };
  } catch (error) {
    throw new Error(error.message);
  }
};
