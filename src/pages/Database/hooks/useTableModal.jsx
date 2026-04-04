// hooks/useTableModal.js
import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateDelivery, updateDeliveryBoxes } from "../../Manifest/api/delivery"

/**
 * Normalizes a flat DB delivery row into the { delivery, shipment } shape
 * that CardManifest + useManifest expect.
 *
 * flat row shape from getDeliveries:
 *   { delivery_id, tracking_number, ..., shipments: {}, delivery_boxes: [] }
 */
const normalizeRow = (row) => {
  if (!row) return null
  if (row.delivery) return row // already shaped (shouldn't happen from table but safe)

  const { shipments, delivery_boxes, ...deliveryFields } = row

  return {
    delivery: {
      ...deliveryFields,
      boxes: delivery_boxes ?? [],
    },
    shipment: shipments ?? {},
  }
}

/**
 * Modal state + field change + submit for ManifestTable.
 * Follows the exact same handleFieldChange contract as useManifest
 * so CardManifest + BoxBreakdown work identically.
 *
 * @param {{ toast, setLoading, queryKey }} options
 *   queryKey — invalidated on successful save so the table re-fetches
 */
export const useTableModal = ({ toast, setLoading, queryKey }) => {
  const queryClient = useQueryClient()

  // Always stored as { delivery, shipment } — normalized on open
  const [selectedDelivery, setSelectedDelivery] = useState(null)
  const [modalMode, setModalMode] = useState("view") // 'view' | 'edit'
  const [editedData, setEditedData] = useState({})

  // ─── Mutations (same API as useManifest) ───────────────────────────────
  const { mutateAsync: saveDelivery } = useMutation({
    mutationFn: ({ deliveryId, fields }) => updateDelivery(deliveryId, fields),
  })

  const { mutateAsync: saveDeliveryBoxes } = useMutation({
    mutationFn: ({ fields }) => updateDeliveryBoxes(fields),
  })

  // ─── Open / close ──────────────────────────────────────────────────────
  const openModal = (row, action) => {
    setEditedData({})
    setSelectedDelivery(normalizeRow(row))
    setModalMode(action) // 'view' | 'edit'
  }

  const closeModal = () => {
    setSelectedDelivery(null)
    setEditedData({})
    setModalMode("view")
  }

  // ─── handleFieldChange — mirrors useManifest exactly ──────────────────
  /**
   * BoxBreakdown calls:  onChange("delivery_boxes", updatedBoxesArray)
   * CardInput calls:     handleFieldChange(deliveryId, "field", value)
   *                   or handleFieldChange(deliveryId, "delivery.field", value)
   */
  const handleFieldChange = (target, fieldOrData, value) => {

    // Case 1: full delivery_boxes array replacement (from BoxBreakdown)
    if (target === "delivery_boxes") {
      const updatedBoxes = fieldOrData

      setEditedData((prev) => ({ ...prev, delivery_boxes: updatedBoxes }))

      setSelectedDelivery((prev) =>
        prev
          ? { ...prev, delivery: { ...prev.delivery, boxes: updatedBoxes } }
          : prev
      )
      return
    }

    // Case 2: regular field (from CardInput)
    const deliveryId = target
    const field = fieldOrData

    // Guard — only update if this is the open delivery
    if (!selectedDelivery || selectedDelivery.delivery?.delivery_id !== deliveryId) return

    const normalizedField = field.replace(/^delivery\./, "")

    setEditedData((prev) => ({
      ...prev,
      [deliveryId]: {
        ...(prev[deliveryId] ?? {}),
        [normalizedField]: value,
      },
    }))

    setSelectedDelivery((prev) =>
      prev
        ? { ...prev, delivery: { ...prev.delivery, [normalizedField]: value } }
        : prev
    )
  }

  // ─── Submit — mirrors useManifest exactly ──────────────────────────────
  const handleSubmit = async () => {
    const updates = Object.entries(editedData)

    if (updates.length === 0) {
      toast.info("Delivery Update", "There's no update to save.")
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

      // Re-fetch table
      if (queryKey) queryClient.invalidateQueries({ queryKey })

      closeModal()
    } catch (err) {
      console.error(err)
      toast.error(
        "Delivery cannot be processed",
        "Something went wrong. Please try again."
      )
    } finally {
      setLoading(false)
    }
  }

  return {
    selectedDelivery,
    modalMode,
    openModal,
    closeModal,
    handleFieldChange,
    handleSubmit,
  }
}