// hooks/useManifest.js
import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { updateDelivery, updateDeliveryBoxes } from "../api/delivery"

export const useManifest = ({ toast, setLoading }) => {
  const [manifestData, setManifestData] = useState(null)
  const [editedData, setEditedData] = useState({})

  const { mutateAsync: saveDelivery } = useMutation({
    mutationFn: ({ deliveryId, fields }) => updateDelivery(deliveryId, fields),
  })

  const { mutateAsync: saveDeliveryBoxes } = useMutation({
    mutationFn: ({ fields }) => updateDeliveryBoxes(fields),
  })

  const selectSearchResult = (deliveryId, searchResults) => {
    setManifestData(
      searchResults.find(d => d.delivery.delivery_id === deliveryId) || null
    )
    setEditedData({})
  }

  const handleFieldChange = (target, fieldOrData, value) => {
    if (target === "delivery_boxes") {
      // fieldOrData is the updated boxes array
      const updatedBoxes = fieldOrData;

      // You can call your API or update state here
      setEditedData((prev) => ({
        ...prev,
        delivery_boxes: updatedBoxes,
      }));

      setManifestData((prev) => ({
        ...prev,
        delivery: {
          ...prev.delivery,
          boxes: updatedBoxes, // just for UI display
        },
      }));
    } else {
      // target is deliveryId
      const deliveryId = target;
      const field = fieldOrData;

      if (!manifestData || manifestData.delivery.delivery_id !== deliveryId) return;

      setEditedData((prev) => ({
        ...prev,
        [deliveryId]: {
          ...prev[deliveryId],
          [field.replace(/^delivery\./, "")]: value,
        },
      }));

      setManifestData((prev) => ({
        ...prev,
        delivery: {
          ...prev.delivery,
          [field.replace(/^delivery\./, "")]: value,
        },
      }));
    }
  };


  const handleSubmit = async () => {
    const updates = Object.entries(editedData)
    if (updates.length === 0) {
      toast.info("Delivery Update", "There's no update to save..")
      return
    }

    setLoading(true)
    try {
      for (const [deliveryId, fields] of updates) {
        if (deliveryId === "delivery_boxes") {
          await saveDeliveryBoxes({ fields })
        } else {
          await saveDelivery({ deliveryId, fields })
        }
      }
      toast.success("Delivery Update", "Saved successfully.")
      setEditedData({})
    } catch (err) {
      console.error(err)
      toast.error("Delivery cannot be processed", "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return {
    manifestData,
    editedData,
    selectSearchResult,
    handleFieldChange,
    handleSubmit,
  }
}