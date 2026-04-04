import { supabase, supaClient } from "../../../supabaseClient";
export const getDeliveries = async (filters = {}, page = 1, rowLimit = 5, restrictions = {}) => {
  try {
    let query = supabase
      .from("deliveries")
      .select(`
        *, 
        shipments!inner(*),
        delivery_boxes!inner (
          box_id,
          delivery_id,
          barcode,
          status
        )`, { count: "exact" })
      .range((page - 1) * rowLimit, page * rowLimit - 1);

    if (filters.search && filters.search.trim() !== "") {
      const sanitized = filters.search.replace(/,/g, "");
      const search = `%${sanitized}%`;

      query = query.or(
        `tracking_number.ilike.${search},shipper_name.ilike.${search},consignee.ilike.${search}`
      );
    }

    if (
      filters.shipment_number &&
      filters.shipment_number.toLowerCase() !== "all"
    ) {
      query = query.eq("shipments.shipment_number", filters.shipment_number);
    }

    if (filters.status && filters.status !== "ALL") {
      query = query.eq("delivery_boxes.status", filters.status);
    }


    if (restrictions.region?.length) {
      const upperRegions = restrictions.region
        .filter(r => r && r.trim() !== "")
        .map(r => r.toUpperCase());

      if (upperRegions.length) {
        query = query.in("destination", upperRegions);
      }
    }

    if (restrictions.city?.length) {
      const normalizedCities = restrictions.city
        .filter(c => c && c.trim() !== "")
        .map(c => c.toLowerCase().replace(" city", "").trim());

      if (normalizedCities.length) {
        query = query.in(
          "city",
          normalizedCities.map(c => c.charAt(0).toUpperCase() + c.slice(1))
        );
      }
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