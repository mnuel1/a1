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
      ...staff
    }));

    return formattedStaffs;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const addStaff = async (staff) => {
  try {
    const { data, error } = await supaClient.insert("user", staff);

    if (error) throw error;

    return { success: true, data };
  } catch (err) {
    throw new Error(err.message || "Failed to add staff");
  }
};

export const updateStaffInfo = async (staff) => {
  try {
    const { id, ...updateFields } = staff;
    if (!id) throw new Error("Staff ID is required");

    const { data, error } = await supaClient.update("user", { id }, updateFields);

    if (error) throw error;

    return { success: true, data };
  } catch (err) {
    throw new Error(err.message || "Failed to update staff info");
  }
};

export const updateStatusStaff = async ({ id, status }) => {
  try {
    if (!id) throw new Error("Staff ID is required");

    const { data, error } = await supaClient.update("user", { id }, { status });

    if (error) throw error;

    return { success: true, data };
  } catch (err) {
    throw new Error(err.message || "Failed to update staff status");
  }
};