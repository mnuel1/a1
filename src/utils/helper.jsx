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
  const boxMatch = field.match(/^box_(\d+)_(barcode|status|init)$/);

  if (boxMatch) {
    const [, boxId, boxField] = boxMatch;
    console.log(boxField);

    const numericBoxId = Number(boxId);
    console.log(numericBoxId);

    if (boxField === "init") {
      console.log(boxField);

      const newBox = value;

      setManifestData?.(prev =>
        prev.map(item => {
          if (item.delivery_id !== deliveryId) return item;

          const existingBoxes = item.delivery_boxes ?? [];

          return {
            ...item,
            delivery_boxes: [...existingBoxes, newBox],
          };
        })
      );

      setEditedData(prev => {
        const existingBoxes = prev.delivery_boxes ?? [];

        return {
          ...prev,
          delivery_boxes: [...existingBoxes, newBox],
        };
      });

      return; // ✅ EARLY EXIT (important)
    }

    setManifestData?.(prev =>
      prev.map(item => {
        if (item.delivery_id !== deliveryId) return item;

        const existingBoxes = item.delivery_boxes ?? [];
        const index = existingBoxes.findIndex(
          box => box.box_id === numericBoxId
        );

        let updatedBoxes;

        if (index >= 0) {

          updatedBoxes = existingBoxes.map(box =>
            box.box_id === numericBoxId
              ? { ...box, [boxField]: value }
              : box
          );
        } else {

          updatedBoxes = [
            ...existingBoxes,
            { box_id: numericBoxId, [boxField]: value },
          ];
        }

        return {
          ...item,
          delivery_boxes: updatedBoxes,
        };
      })
    );

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

export const submitManifestCreate = async ({
  selectedDelivery,
  createDelivery,
  updateShipment,
  insertDeliveryBoxes,
  setLoading,
  toast,
  onSuccess,
  onError,
}) => {
  if (!selectedDelivery) {
    toast.error("No delivery data to submit.");
    return;
  }

  setLoading(true);

  try {
    const {
      delivery_id,          // ❌ ignore
      shipment_number,
      container_number,
      delivery_boxes,
      qty,
      ...deliveryPayload
    } = selectedDelivery;

    /**
     * 1️⃣ Update shipment & get shipment_id
     */
    const { data: shipment, error: shipmentError } =
      await updateShipment({
        shipment_number,
        container_number,
        qty: Number(qty ?? 0),
      });

    if (shipmentError || !shipment) {
      throw shipmentError || new Error("Shipment not found");
    }

    const shipment_id = shipment.shipment_id;
    /**
     * 2️⃣ Insert delivery WITH shipment_id
     */
    const { data: insertedDelivery, error: insertError } =
      await createDelivery({
        ...deliveryPayload,
        shipment_id,
      });

    if (insertError || !insertedDelivery) {
      throw insertError || new Error("Failed to create delivery");
    }

    const newDeliveryId = insertedDelivery.delivery_id;

    /**
     * 3️⃣ Insert delivery boxes
     */
    if (Array.isArray(delivery_boxes) && delivery_boxes.length > 0) {
      const boxesPayload = delivery_boxes.map(b => ({
        delivery_id: newDeliveryId,
        barcode: b.barcode,
        status: b.status ?? "PENDING",
      }));

      const { error: boxesError } =
        await insertDeliveryBoxes(boxesPayload);

      if (boxesError) throw boxesError;
    }

    toast.success("Delivery created successfully.");
    onSuccess?.(insertedDelivery);

  } catch (err) {
    console.error(err);
    toast.error("Failed to create delivery.");
    onError?.(err);
  } finally {
    setLoading(false);
  }
};

export const ALLOWED_DELIMITERS_REGEX = /[,;/]/;

export const splitBarcodes = (barcodeString) => {
  return barcodeString
    .split(/[,;/]/)
    .map(b => b.trim())
    .filter(Boolean);
};

