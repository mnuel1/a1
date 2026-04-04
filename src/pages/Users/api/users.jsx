import { supabase, supaClient } from "../../../supabaseClient";

export const getUsers = async () => {
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

export const addUser = async (staff) => {
  try {
    const { data, error } = await supaClient.insert("user", staff);

    if (error) throw error;

    return { success: true, data };
  } catch (err) {
    throw new Error(err.message || "Something went wrong. Please try again later.");
  }
};

export const updateUserInfo = async (user) => {
  try {
    console.log(user);
    
    const { id, ...updateFields } = user;
    if (!id) throw new Error("Something went wrong. Please try again later.");

    const { data, error } = await supaClient.update("user", { id }, updateFields);

    if (error) throw error;

    return { success: true, data };
  } catch (err) {
    throw new Error(err.message || "Something went wrong. Please try again later.");
  }
};

export const updateUserStatus = async ({ id, status }) => {
  try {
    if (!id) throw new Error("Something went wrong. Please try again later.");

    const { data, error } = await supaClient.update("user", { id }, { status });

    if (error) throw error;

    return { success: true, data };
  } catch (err) {
    throw new Error(err.message || "Something went wrong. Please try again later.");
  }
};