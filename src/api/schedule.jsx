import { supabase } from "../supabaseClient";

export const getSchedules = async () => {
  try {
    const { data, error } = await supabase.from("schedules").select("*");

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return [];
    }

    const formatted = data.map((event) => ({
      title: event.details,
      start: `${event.date}T${event.time}`,
    }));    

    return formatted;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const addSchedule = async (title, time, selectedDate) => {
  try {
    
    const { error } = await supabase.from("schedules").insert({
      details: title,
      date: selectedDate,
      time,
    });

    if (error) {
      return { success: false}
    }

    return { success: true }
  } catch (error) {
    throw new Error(error.message);
  }
};
