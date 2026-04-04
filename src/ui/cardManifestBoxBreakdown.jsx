import React, { useState } from "react"
import { PlusCircleIcon } from "lucide-react"

let tempBoxIdCounter = 1

const BoxBreakdown = ({
  deliveryId,
  boxes = [],
  statusOptions = [],
  editable,
  onChange,
  isCreate = false
}) => {
  const [addCount, setAddCount] = useState(1)

  const handleChange = (boxId, field, value) => {
    const updatedBoxes = boxes.map(b =>
      b.box_id === boxId ? { ...b, [field]: value } : b
    )
    onChange("delivery_boxes", updatedBoxes)
  }

  const removeBox = (boxId) => {
    const updatedBoxes = boxes.filter(b => b.box_id !== boxId)
    onChange("delivery_boxes", updatedBoxes)
  }

  const addBoxes = () => {
    const newBoxes = Array.from({ length: addCount }, () => ({
      barcode: "",
      status: "NONE",
      delivery_id: deliveryId,
      box_id: `temp-${tempBoxIdCounter++}`
    }))
    onChange("delivery_boxes", [...boxes, ...newBoxes])
  }

  const handleSetAllStatus = (value) => {
    if (!value) return
    const updatedBoxes = boxes.map(b => ({ ...b, status: value }))
    onChange("delivery_boxes", updatedBoxes)
  }

  return (
    <div className="border-l border-gray-200 px-4 py-2">
      <div className="flex justify-between text-sm mb-4">
        <span>Total Boxes: <strong>{boxes.length}</strong></span>
        <span>Delivered: <strong>{boxes.filter(b => b.status === "DELIVERED").length}</strong></span>
      </div>

      {editable && (
        <div className="mb-3">
          <p className="text-xs text-gray-600">All status</p>
          <select
            className="border px-2 py-1 rounded w-full"
            defaultValue=""
            onChange={(e) => handleSetAllStatus(e.target.value)}
          >
            <option value="">Set all status</option>
            {statusOptions.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-[auto_minmax(70px,1fr)_minmax(150px,2fr)] gap-2 text-xs font-semibold mb-2">
        {/* HEADER */}
        <span></span>
        <strong>Barcode No.</strong>
        <strong>Status</strong>

        {/* ROWS */}
        {boxes.map((box, index) => (
          <React.Fragment key={box.box_id ?? `new-${index}`}>
            <span className="text-xs flex items-center gap-1 group">
              <span className="group-hover:hidden">{index + 1}</span>
              {editable && (
                <button
                  type="button"
                  className="hidden group-hover:inline text-red-500 text-xs font-bold cursor-pointer"
                  onClick={() => removeBox(box.box_id)}
                >
                  ✕
                </button>
              )}
            </span>

            <input
              className="border px-2 py-1 rounded w-full box-border"
              value={box.barcode}
              disabled={!editable}
              onChange={(e) => editable && handleChange(box.box_id, "barcode", e.target.value)}
            />

            <select
              className="border px-2 py-1 rounded w-full box-border"
              value={box.status}
              disabled={!editable}
              onChange={(e) => editable && handleChange(box.box_id, "status", e.target.value)}
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </React.Fragment>
        ))}
      </div>

      {editable && (
        <div className="flex gap-2 mb-3 my-2 justify-end items-center">
          <button
            type="button"
            className="text-primary rounded cursor-pointer"
            onClick={addBoxes}
          >
            <PlusCircleIcon />
          </button>
          <input
            type="number"
            min={1}
            className="border px-2 py-1 rounded w-20"
            value={addCount}
            onChange={(e) => setAddCount(Number(e.target.value))}
          />
        </div>
      )}
    </div>
  )
}

export default BoxBreakdown