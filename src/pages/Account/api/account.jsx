import bcrypt from "bcryptjs";
import { supabase, supaClient } from "../../../supabaseClient";

export const updateLoginID = async (loginID, id) => {
  try {
    if (!validateLoginID(loginID)) {
      throw new Error("Login ID is required");
    }

    if (!id || typeof id !== "string") {
      throw new Error("Something went wrong. Please try again.");
    }

    const { data, error } = await supaClient.update(
      "user",
      { id },
      { login_id: loginID }
    );

    if (error) throw new Error(error.message);

    return { success: true, data };
  } catch (error) {
    throw new Error(error.message || "Something went wrong. Please try again later.");
  }
};

export const updatePassword = async (password, confirmPassword, id) => {
  try {
    if (!validatePassword(password)) {
      throw new Error("Password is required");
    }

    if (password !== confirmPassword) {
      throw new Error("Passwords don't match");
    }

    if (!id) {
      throw new Error("Something went wrong. Please try again.");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const { data, error } = await supaClient.update(
      "user",
      { id },
      { password: passwordHash }
    );

    if (error) throw new Error(error.message);

    return { success: true, data };
  } catch (error) {
    throw new Error(error.message || "Something went wrong. Please try again later.");
  }
};

export const getAccountData = async (userId, onChange) => {
  try {
    if (!userId) return { data: null, unsubscribe: null };

    const { data, error } = await supabase
      .from("user")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.log(error);
      return { data: null, unsubscribe: null };
    }

    if (onChange && data) onChange(data);

    const channel = supabase
      .channel(`user-${userId}-changes`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user", filter: `id=eq.${userId}` },
        (payload) => {
          console.log("User updated:", payload);

          if (payload.new && onChange) {
            onChange(payload.new);
          }
        }
      )
      .subscribe();

    return { data, unsubscribe: () => supabase.removeChannel(channel) };

  } catch (error) {
    console.log(error);
    return { data: null, unsubscribe: null };
  }
};



function validateLoginID(loginID) {
  return typeof loginID === "string" && loginID.trim().length > 1;
}

function validatePassword(password) {
  return typeof password === "string" && password.trim().length > 1;
}
