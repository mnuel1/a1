const BoxBreakdown = ({
  deliveryId,
  totalBoxes = 0,
  deliveredBoxes = 0,
  boxes = [],
  statusOptions = [],
  editable,
  onChange
}) => {
  const handleChange = (boxId, field, value) => {
    const compositeField = `box_${boxId}_${field}`;
    onChange(deliveryId, compositeField, value);
  };

  return (
    <div className="border-l border-gray-200 px-4 py-2">
      {/* SUMMARY */}
      <div className="flex justify-between text-sm mb-4">
        <span>Total Boxes: <strong>{totalBoxes}</strong></span>
        <span>Delivered: <strong>{deliveredBoxes}</strong></span>
      </div>

      {/* HEADER */}
      <div className="grid grid-cols-[20px_1fr_1fr] gap-2 text-xs font-semibold mb-2">
        <span></span>
        <strong>Barcode No.</strong>
        <strong>Status</strong>
      </div>

      {/* ROWS */}
      <div className="space-y-2">
        {boxes.map((box, index) => (
          <div
            key={box.box_id}
            className="grid grid-cols-[20px_1fr_1fr] gap-2 items-center"
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
    </div>
  );
};

export default BoxBreakdown;
