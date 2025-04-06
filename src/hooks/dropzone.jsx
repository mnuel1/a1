import { useDropzone } from 'react-dropzone';
import { readExcelFile } from '../utils/excelReader';
import toast from 'react-hot-toast';
// import { uploadManifest } from '../api/manifest';

export const useDropzoneExcel = (onSuccess) => {
  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];

    if (!file.name.endsWith('.xlsx')) {
      toast.error('Invalid file format. Please upload an Excel file.');
      return;
    }

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
        console.log(payload);
        
        // const uploaded = await uploadManifest(payload);
        // if (uploaded) {
        //   toast.success('Manifest excel uploaded successfully!');
        //   onSuccess(payload);
        // } else {
        //   toast.error('Failed to upload data.');
        // }
      } else {
        toast.error('SHIPMENT NUMBER or CONTAINER NUMBER not found.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong. File cannot be read.');
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
