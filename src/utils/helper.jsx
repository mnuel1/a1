import { Eye, Edit, Trash } from "lucide-react";

export const buildColumns = (config, onAction, canEdit) => {
  return config
    .filter((col) => col.displayFlags.table)
    .map((col) => {
      if (col.type === "actions") {
        return {
          name: col.label,
          cell: (row) => (
            <div className="flex gap-2 justify-center items-center">
              <button
                className="text-gray-700 py-1 rounded text-xs hover:text-blue-900 cursor-pointer"
                onClick={() => onAction?.(row, "view")}
              >
                <Eye size={14} />
              </button>
              {canEdit && 
                <button
                  className="text-blue-500 py-1 rounded text-xs hover:text-blue-600 cursor-pointer"
                  onClick={() => onAction?.(row, "edit")}
                >
                  <Edit size={14} />
                </button>
              }
              {/* Optional delete */}
              {/* <button
                className="text-red-500 py-1 rounded text-xs hover:text-red-600 cursor-pointer"
                onClick={() => onAction?.(row, "delete")}
              >
                <Trash size={14} />
              </button> */}
            </div>
          ),
          ignoreRowClick: true,
          width: col.width || "120px",
        };
      }

      return {
        name: col.label,
        selector: (row) => row[col.key] ?? `No ${col.label.toLowerCase()}`,
        sortable: col.sortable || false,
        style: col.sticky
          ? {
              position: "sticky",
              right: 0,
              minWidth: col.minWidth || "120px",
              backgroundColor: "white",
            }
          : {},
      };
    });
};


export const applyFieldChange = ({
  deliveryId,
  field,
  value,
  setManifestData,
  setEditedData,
}) => {
  const boxMatch = field.match(/^box_(\d+)_(barcode|status)$/);

  // 🧱 BOX FIELD
  if (boxMatch) {
    const [, boxId, boxField] = boxMatch;
    const numericBoxId = Number(boxId);

    // update manifestData (UI state)
    setManifestData?.(prev =>
      prev.map(item =>
        item.delivery_id === deliveryId
          ? {
              ...item,
              delivery_boxes: (item.delivery_boxes ?? []).map(box =>
                box.box_id === numericBoxId
                  ? { ...box, [boxField]: value }
                  : box
              ),
            }
          : item
      )
    );

    // update editedData (payload state)
    setEditedData(prev => {
      const existingBoxes = prev.delivery_boxes ?? [];
      const index = existingBoxes.findIndex(
        b => b.box_id === numericBoxId
      );

      let updatedBoxes;
      if (index >= 0) {
        updatedBoxes = existingBoxes.map(b =>
          b.box_id === numericBoxId
            ? { ...b, [boxField]: value }
            : b
        );
      } else {
        updatedBoxes = [
          ...existingBoxes,
          { box_id: numericBoxId, [boxField]: value },
        ];
      }

      return {
        ...prev,
        delivery_boxes: updatedBoxes,
      };
    });

    return;
  }

  setEditedData(prev => ({
    ...prev,
    [deliveryId]: {
      ...prev[deliveryId],
      [field]: value,
    },
  }));

  setManifestData?.(prev =>
    prev.map(item =>
      item.delivery_id === deliveryId
        ? { ...item, [field]: value }
        : item
    )
  );
};

export const submitManifestEdits = async ({
  editedData,
  updateDelivery,
  setLoading,
  onSuccess,
  onError,
  toast,
}) => {
  const updates = Object.entries(editedData);

  if (updates.length === 0) {
    toast("No changes to save.");
    return;
  }

  setLoading(true);

  try {
    for (const [deliveryId, fields] of updates) {

      const response = await updateDelivery(deliveryId, fields);
      if (response?.error) throw response.error;
    }

    toast.success("Saved successfully.");
    onSuccess?.();
  } catch (err) {
    console.error(err);
    toast.error("Update failed.");
    onError?.(err);
  } finally {
    setLoading(false);
  }
};
