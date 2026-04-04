import { supabase } from "../../../supabaseClient";

export const searchDeliveries = async (query) => {
  try {
    if (!query?.trim()) throw new Error("Search query cannot be empty");

    const { data, error } = await supabase.rpc("search_deliveries", { query });

    if (error) throw error;

    if (!data || data.length === 0) {
      return { searchResult: [], searchFound: false };
    }
    
    const results = data;
    
    return {
      searchResult: results,
      searchFound: results.length > 0,
    };
  } catch (error) {
    console.error(error);
    return { searchResult: [], searchFound: false };
  }
};