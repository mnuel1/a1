
const ExpandedRow = ({ data }) => {
  return (
    <div className="p-4 bg-gray-50 border-t">
      <div className="grid grid-cols-[20px_160px_160px] gap-2 text-xs font-semibold mb-2">
        <span></span>
        <span>Barcode No.</span>
        <span>Status</span>
      </div>

      <div className="space-y-2">
        {(data.delivery_boxes ?? []).map((box, index) => (
          <div
            key={box.box_id}
            className="grid grid-cols-[20px_160px_160px] gap-2 items-center"
          >
            <span>{index + 1}.</span>
            <p className="px-2 py-1">{box.barcode}</p>
            <p className="px-2 py-1">{box.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpandedRow;