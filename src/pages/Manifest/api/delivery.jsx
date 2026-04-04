import { supabase, supaClient } from "../../../supabaseClient";

export const updateDelivery = async (deliveryId, updatedFields) => {
  try {
    const { data, error } = await supaClient.update(
      "deliveries",
      { delivery_id: deliveryId },
      updatedFields,
      "*"
    )

    if (error) throw error
    if (!data || data.length === 0) {
      return { error: true, message: `${deliveryId} not found` }
    }

    return { success: true, message: `${deliveryId} updated successfully`, data }
  } catch (error) {
    console.error(error)
    return { error: error.message }
  }
}

export const updateDeliveryBoxes = async (updatedFields) => {
  try {
    console.log(updatedFields);
    
    if (!updatedFields || !Array.isArray(updatedFields)) {
      throw new Error("Invalid boxes array");
    }

    const deliveryIdFromBoxes = updatedFields[0]?.delivery_id;
    if (!deliveryIdFromBoxes) {
      throw new Error("delivery_id is required in box data");
    }

    // Start a transaction
    const { data: transactionResult, error: transactionError } = await supabase.rpc(
      "update_delivery_boxes", // We will implement a SQL function for the transaction
      { updated_fields: updatedFields }
    );

    if (transactionError) {
      console.error("Transaction failed:", transactionError);
      throw transactionError;
    }

    return {
      success: true,
      message: `Boxes for delivery ${deliveryIdFromBoxes} updated successfully`,
      data: transactionResult,
    };
  } catch (error) {
    console.error(error);
    return { error: error.message };
  }
};