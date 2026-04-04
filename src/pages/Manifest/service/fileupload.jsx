import { 
  selectSheetAndModeModal, 
  inputShipmentDetailsModal,
  errorTableModal } from "../../../ui/modals";
  import { processSheet } from "../../../utils/excelReader";

export const FileUploadService = async ({
  showModal, 
  toast,
  setLoading,
  file,
  sheetNames
}) => {
  try {
    // Ask user to select sheet + mode
    const { selectedSheet, selectedMode } = await selectSheetAndModeModal({
      showModal,
      sheetNames,
    });

    if (!selectedSheet) return toast.error("Please select a sheet first.");

    // Run processSheet
    let overrides = {};
    let result = await processSheet(
      setLoading,
      file,
      selectedSheet,
      overrides,
      selectedMode,
      showModal,
      toast
    );

    // Handle missing shipment/container
    if (result.requiresInput) {
      const { shipmentNo, containerNo } = await inputShipmentDetailsModal({
        showModal,
        toast,
      });

      // Retry processSheet with shipment/container overrides
      result = await processSheet(
        setLoading,
        file,
        selectedSheet,
        { shipmentNo, containerNo },
        selectedMode,
        showModal,
        toast
      );
    }

    // Handle failure
    if (!result.success) {
      const errorRowData = result?.data?.manifestData;
      if (errorRowData) {
        await errorTableModal(showModal, errorRowData, result.message);
      } else {
        toast.error("File cannot be processed.", "Something went wrong when uploading the file. Please try again.");
      }
      return;
    }

    // Handle success messages
    if (selectedMode === "insert") toast.success("File uploaded!", "New Manifest is now added in the database.");
    else if (selectedMode === "reconcile") toast.success("File uploaded!", "Delivery Boxes are updated based on the new manifest uploaded.");
    else if (selectedMode === "compare") {
      console.log("Comparison result:", result.data);
      toast.success("File processed!", "Comparison is done. Check the table for details.");
    }
  } catch (err) {
    console.error(err);
    toast.error("File cannot be processed.", "Something went wrong when uploading the file. Please try again.");
  }

}