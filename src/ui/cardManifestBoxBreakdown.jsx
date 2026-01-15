import { useState, useEffect } from "react";
import { PlusCircleIcon } from "lucide-react";

const BoxBreakdown = ({
  deliveryId,
  totalBoxes = 0,
  deliveredBoxes = 0,
  boxes = [],
  statusOptions = [],
  editable,
  onChange,
  isCreate = false
}) => {
  const [localBoxes, setLocalBoxes] = useState([]);
  const [addCount, setAddCount] = useState(1);

  useEffect(() => {
    setLocalBoxes(boxes);
  }, [boxes]);

  const handleChange = (boxId, field, value) => {
    const compositeField = `box_${boxId}_${field}`;
    onChange(deliveryId, compositeField, value);
  };

  const addBoxes = () => {
    const count = Math.max(1, Number(addCount));

    const newBoxes = Array.from({ length: count }).map((_, i) => ({
      box_id: Date.now() + i,
      barcode: "",
      status: "NONE",
    }));

    setLocalBoxes(prev => [...prev, ...newBoxes]);

    newBoxes.forEach(box => {
      handleChange(box.box_id, "barcode", box.barcode);
      handleChange(box.box_id, "status", box.status);
    });
  };

  return (
    <div className="border-l border-gray-200 px-4 py-2">
      {/* SUMMARY */}
      <div className="flex justify-between text-sm mb-4">
        <span>Total Boxes: <strong>{totalBoxes}</strong></span>
        <span>Delivered: <strong>{deliveredBoxes}</strong></span>
      </div>

      {editable && (
        <div className="mb-3">
          <p className="text-xs text-gray-600">All status</p>
          <select
            className="border px-2 py-1 rounded w-full"
            defaultValue=""
            onChange={(e) => {
              const value = e.target.value;
              if (!value) return;

              setLocalBoxes(prev =>
                prev.map(box => ({
                  ...box,
                  status: value,
                }))
              )

              localBoxes.forEach(box => {
                handleChange(box.box_id, "status", value);
              });
            }}
          >
            <option value="">Set all status</option>
            {statusOptions.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      )}


      {/* HEADER */}
      <div className="grid grid-cols-[11px_170px_150px] gap-2 text-xs font-semibold mb-2">
        <span></span>
        <strong>Barcode No.</strong>
        <strong>Status</strong>
      </div>

      {/* ROWS */}
      <div className="space-y-2 overflow-y-auto max-h-[260px] ">

        {localBoxes.map((box, index) => (
          <div
            key={box.box_id}
            className="grid grid-cols-[11px_170px_150px] gap-2 items-center"
          >
            <span className="text-xs">{index + 1}</span>

            <input
              className="border px-2 py-1 rounded"
              value={box.barcode}
              disabled={!editable}
              onChange={(e) => editable && handleChange(box.box_id, "barcode", e.target.value)}
            />

            <select
              className="border px-2 py-1 rounded"
              value={box.status}
              disabled={!editable}
              onChange={(e) => editable && handleChange(box.box_id, "status", e.target.value)}
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>


      {/* <hr className="my-2" />
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
            onChange={(e) => setAddCount(e.target.value)}
          />

        </div>
      )} */}
    </div>
  );
};

export default BoxBreakdown;
