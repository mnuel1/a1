import React, { useState, useEffect } from "react";
import { Search, UploadCloud } from "lucide-react";
import clsx from "clsx";

import toast from "react-hot-toast";
import Input from "../ui/input";
import Status from "../ui/status";

import { useDropzoneExcel } from "../hooks/dropzone";
import { useLoading } from '../context/useLoading';


const Manifest = () => {
  const [manifestData, setManifestData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const { setLoading } = useLoading()
  const { getRootProps, getInputProps, isDragActive } = useDropzoneExcel(setLoading);

  const handleSearch = (e) => {

    setSearchTerm(e.target.value);
  };

  const filteredData = manifestData.filter((row) =>
    Object.values(row).some((val) =>
      val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );


  return (
    <div className="flex h-full w-full">
      <div className="relative flex h-full w-full flex-col p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Manifest</h2>
        </div>
        <div className="focus-within:ring-primary mb-4 flex w-full items-center
            space-x-1 rounded-lg border border-gray-300 px-2 py-1 focus-within:ring-2">
         <Search className="text-gray-500 h-5 w-5" />
         <input
           type="text"
           placeholder="Search a name, barcode or tracking number here..."
           value={searchTerm}
           onChange={handleSearch}
           className="ml-2 w-full focus:outline-none"
         />
       </div>

       
      <div
        {...getRootProps()}
        className={clsx(
          "rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer w-full h-full",
          isDragActive ? "border-2 border-dashed border-blue-500 bg-blue-100" : "border-gray-300"
        )}
      >
        <input {...getInputProps()} />
        {isDragActive && <UploadCloud className="h-10 w-10 text-gray-500" /> }
        <p className="text-gray-600 mt-2">                      
            Search a barcode, name, or tracking number to display the record here.          
        </p>
        <p className="text-gray-400 mt-2">
          Note: Drag & Drop or Click here to upload the manifest excel to the database
        </p>

        
      </div>

      </div>
    </div>
  
    //   {/* Shipment Info */}
    //   <div className="mt-6 grid grid-cols-3 gap-4">
    //     {/* <Status label="Shipment No" value={shipmentNo} />
    //     <Status label="Container No" value={containerNo} />
    //     <Status label="Total Boxes" value={totalBoxes} /> */}
    //   </div>


    //   {/* Table */}
    //   <div className="mt-6 overflow-auto">
    //     <table className="w-full border-collapse border">
    //       <thead>
    //         <tr className="bg-gray-200 text-left">
    //           {manifestData.length > 0 &&
    //             Object.keys(manifestData[0]).map((key) => (
    //               <th key={key} className="border p-2">
    //                 {key}
    //               </th>
    //             ))}
    //         </tr>
    //       </thead>
    //       <tbody>
    //         {paginatedData.map((row, index) => (
    //           <tr key={index} className="border">
    //             {Object.values(row).map((val, idx) => (
    //               <td key={idx} className="border p-2 text-sm">
    //                 {val}
    //               </td>
    //             ))}
    //           </tr>
    //         ))}
    //       </tbody>
    //     </table>
    //   </div>
  );
};

export default Manifest;
