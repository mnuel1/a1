export const selectSheetAndModeModal = async ({ showModal, sheetNames }) => {
  return await new Promise((resolve) => {
    let sheet = null;
    let mode = "insert";

    showModal({
      title: "Select a Sheet and Mode",
      content: (
        <div className="flex flex-col gap-4">
          <div>
            <strong>Choose a sheet:</strong>
            {sheetNames.map((name) => (
              <label key={name} className="flex gap-2 items-center mt-1">
                <input
                  type="radio"
                  name="sheet"
                  value={name}
                  onChange={(e) => (sheet = e.target.value)}
                />
                {name}
              </label>
            ))}
          </div>
          <div>
            <strong>Choose mode:</strong>
            <label className="flex gap-2 items-center mt-1">
              <input
                type="radio"
                name="mode"
                value="insert"
                defaultChecked
                onChange={() => (mode = "insert")}
              />
              Insert new manifest
            </label>
            <label className="flex gap-2 items-center mt-1">
              <input
                type="radio"
                name="mode"
                value="reconcile"
                onChange={() => (mode = "reconcile")}
              />
              Update delivery boxes
            </label>
            <label className="flex gap-2 items-center mt-1">
              <input
                type="radio"
                name="mode"
                value="compare"
                onChange={() => (mode = "compare")}
              />
              Compare Excel vs DB
            </label>
          </div>
        </div>
      ),
      confirmText: "Continue",
      onConfirm: () =>
        resolve({ selectedSheet: sheet, selectedMode: mode }),
    });
  });
};


export const inputShipmentDetailsModal = async ({ showModal, toast }) => {
  return await new Promise((resolve) => {
    let shipmentNo = "";
    let containerNo = "";

    showModal({
      title: "Enter Shipment Details",
      sub: "Shipment and Container not found. Please fill up before proceeding.",
      content: (
        <div className="flex gap-3">
          <div className="flex flex-col gap-2">
            <strong>Shipment Number</strong>
            <input
              type="text"
              className="border px-2 rounded"
              onChange={(e) => (shipmentNo = e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <strong>Container Number</strong>
            <input
              type="text"
              className="border px-2 rounded"
              onChange={(e) => (containerNo = e.target.value)}
            />
          </div>
        </div>
      ),
      confirmText: "Submit",
      onConfirm: () => {
        if (!shipmentNo || !containerNo) {
          toast.error("Both fields are required.");
          return;
        }
        resolve({ shipmentNo, containerNo });
      },
    });
  });
};

export const errorTableModal = async ({ showModal, errorRowData, message }) => {
  showModal({
    type: "table",
    data: errorRowData,
    content: message || "Error processing the sheet",
    cancelText: "Close",
  });
}

export const confirmUserStatusChange = async (showModal, user, onConfirm) => {
  return showModal({
    type: "confirm",
    title: "Confirm Status Change",
    content: `Are you sure you want to change the status of ${user.name} to ${user.status === "Active" ? "Inactive" : "Active"}?`,
    confirmText: "Yes",
    cancelText: "No",
    onConfirm,
  });
};

export const editShipmentModal = async ({
  showModal,
  toast,
  setLoading,
  shipment,
  updateShipment,
}) => {
  return new Promise((resolve) => {
    let shipmentNo = shipment.shipment_number;
    let containerNo = shipment.container_number;

    showModal({
      title: "Edit Shipment",
      content: (
        <div className="flex gap-3">
          <div className="flex flex-col">
            <strong>Shipment Number</strong>
            <input
              defaultValue={shipmentNo}
              className="border px-2 py-1 rounded"
              onChange={(e) => (shipmentNo = e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <strong>Container Number</strong>
            <input
              defaultValue={containerNo}
              className="border px-2 py-1 rounded"
              onChange={(e) => (containerNo = e.target.value)}
            />
          </div>
        </div>
      ),
      confirmText: "Save",
      onConfirm: async () => {
        if (!shipmentNo || !containerNo) {
          toast.error("Both fields are required.");
          return;
        }

        try {
          setLoading(true);

          await updateShipment({
            id: shipment.shipment_number,
            shipment_number: shipmentNo,
            container_number: containerNo,
            qtyUpd: false,
          });

          toast.success("Shipment updated!");

          window.location.reload();

          resolve({ shipmentNo, containerNo });
        } catch (err) {
          console.error(err);
          toast.error("Failed to update shipment");
        } finally {
          setLoading(false);
        }
      },
    });
  });
};