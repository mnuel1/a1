import { useDropzone } from 'react-dropzone';
import { readExcelFile } from '../utils/excelReader';
import toast from 'react-hot-toast';

import { uploadManifest } from '../api/manifest';

export const useDropzoneExcel = (setLoading, onSuccess) => {
  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];

    if (!file.name.endsWith('.xlsx')) {
      throw new Error('Invalid file format. Please upload an Excel file.');      
    }
    setLoading(true)
    try {
      const excelData = await readExcelFile(file);

      let shipmentNo = '';
      let containerNo = '';
      let totalBoxes = '';

      const filteredData = excelData.filter((row) => {
        const values = Object.values(row).map((v) => v?.toString().trim());
        let shouldRemove = false;

        values.forEach((v, i) => {
          if (v?.startsWith('SHIPMENT NUMBER :')) {
            shipmentNo = values[i + 1]?.trim() || '';
            shouldRemove = true;
          } else if (v?.startsWith('CONTAINER NUMBER :')) {
            containerNo = values[i + 1]?.trim() || '';
            shouldRemove = true;
          } else if (v?.startsWith('TOTAL NUMBER OF BOXES :')) {
            totalBoxes = values[i + 1]?.trim() || '';
            shouldRemove = true;
          } else if (v?.startsWith('CONTENTS')) {
            shouldRemove = true;
          }
        });

        return !shouldRemove;
      });

      if (shipmentNo && containerNo) {
        const payload = {
          manifestData: filteredData,
          shipmentNo,
          containerNo,
          totalBoxes,
        };
        const result = await uploadManifest(payload)

        if (!result.success) {
          throw new Error("Something went wrong. Please try again.")
        }
        
        toast.success("New manifest file uploaded successfully.")
      } else {
        throw new Error('Shipiment number or containert number was not found.');
      }
    } catch (error) {      
      toast.error(error.message);
    } finally {
      setLoading(false)
    }
  };

  return useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
  });
};
