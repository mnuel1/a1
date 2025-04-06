import { supabase } from "../supabaseClient";

export const fetchStaffs = async () => {
  try {
    const { data, error } = await supabase
      .from("user")
      .select("id, name, role, access, status");

    if (error) {
      throw new Error(error.message);
    }

    const formattedStaffs = data.map((staff) => ({
      ...staff,
      access: Array.isArray(staff.access)
        ? staff.access.map((a) => a.permission || a)
        : [],
    }));

    return formattedStaffs;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const addStaff = async (staff) => {
  try {
    const { error } = await supabase.from("user").insert([staff]);

    if (error) {
      throw new Error(error.message);
    }

    return { success: true };
  } catch (error) {
    throw new Error(error.message);
  }
};

export const updateStaffInfo = async (staff) => {
  try {
    const { id, ...updateFields } = staff;

    const { error } = await supabase
      .from("user")
      .update(updateFields)
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }

    return { success: true };
  } catch (error) {
    throw new Error(error.message);
  }
};

export const updateStatusStaff = async (staff) => {
  try {
    const { id, status } = staff;

    const { error } = await supabase
      .from("user")
      .update({ status: status })
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }

    return { success: true };
  } catch (error) {
    throw new Error(error.message);
  }
};
