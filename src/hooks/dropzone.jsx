import { useDropzone } from "react-dropzone";
import { getSheetNames } from "../utils/excelReader";

export const useDropzoneExcel = (setLoading, onFileDrop) => {
  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];

    if (!file.name.endsWith(".xlsx")) {
      throw new Error("Please upload an Excel file.");
    }

    setLoading(true);
    try {
      const names = await getSheetNames(file);
            
      if (onFileDrop) onFileDrop(file, names);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    },
  });
};
