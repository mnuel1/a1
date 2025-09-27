import React, { useState, useEffect, act } from "react";
import { Search, UploadCloud } from "lucide-react";
import clsx from "clsx";

import toast from "react-hot-toast";
import { useDropzoneExcel } from "../hooks/dropzone";
import { useLoading } from "../context/useLoading";
import { useModal } from '../context/useModal'
import { searchDeliveries, updateDelivery } from "../api/manifest";

import { processSheet } from "../utils/excelReader";

const Manifest = () => {
  
  const [editedData, setEditedData] = useState({});
  const [manifestData, setManifestData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState(null);
  const { showModal } = useModal();

  const { setLoading } = useLoading();

  const handleFileDrop = (file, sheetNames) => {
    let selectedSheet = null;

    showModal({
      title: "Select a Sheet",
      content: (
        <div>
          {sheetNames.map((name) => (
            <label key={name} className="flex gap-2">
              <input
                type="radio"
                name="sheet"
                value={name}
                onChange={(e) => {
                  selectedSheet = e.target.value;
                }}
              />
              {name}
            </label>
          ))}
        </div>
      ),
      onConfirm: async () => {
        if (!selectedSheet) {
          toast.error("Please select a sheet first.");
          return;
        }
        const result = await processSheet(setLoading, file, selectedSheet);

        if (!result.success) {
          toast.error(result.message)
          return;
        }

        toast.success("New manifest uploaded!")
      },
    });
  };

  const { getRootProps, getInputProps, isDragActive } =
    useDropzoneExcel(setLoading, handleFileDrop)
    
  const handleChange = (e) => {
    const search = e.target.value;
    setSearchTerm(search);
  };

  const handleSearch = async () => {
    
    const result = await searchDeliveries(searchTerm.trim());
    if (!result.searchFound) {
      toast.error("No result.");
    }
    console.log(result)
    
    setManifestData(result.searchResult);
    
    if (result.searchResult.length > 0) {      
      setActiveTab(`${result.searchResult[0].shipments.shipment_number} - ${result.searchResult[0].tracking_number.split("/")[0]}`);
      console.log(activeTab)
      
    }
  };

  const shipmentTabs = Array.from(
    new Set(
      manifestData.map(
        (item) =>
          `${item.shipments.shipment_number} - ${item.tracking_number.split("/")[0]}`
      )
    )
  );

  const filteredManifest = manifestData.filter(
    (item) =>
      `${item.shipments.shipment_number} - ${item.tracking_number.split("/")[0]}` ===
      activeTab
  );

  const handleFieldChange = (deliveryId, field, value) => {
    setEditedData((prev) => ({
      ...prev,
      [deliveryId]: {
        ...prev[deliveryId],
        [field]: value,
      },
    }));
            
    // Also update UI immediately for better UX
    setManifestData((prev) =>
      prev.map((item) =>
        item.delivery_id === deliveryId ? { ...item, [field]: value } : item
      )
    );
  };
  // !! PENDING 
  // GENERATE DRS
  // INTEGRATE TABLE DRIVEN
  // ADD SETTINGS PAGE
  
  const handleSubmit = async () => {
    const updates = Object.entries(editedData);
  
    if (updates.length === 0) {
      toast("No changes to save.");
      return;
    }

    setLoading(true);
    try {
      for (const [deliveryId, fields] of updates) {
        await updateDelivery(deliveryId, fields);
      }
      toast.success(`Saved successfully.`);
      setEditedData({});
    } catch (err) {
      console.error(err);
      toast.error(`Update failed.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full w-full bg-gray-50">
      <div className="relative flex h-full w-full flex-col p-6 bg-white shadow-md rounded-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-800">Manifest</h2>
        </div>
        <div
          className="focus-within:ring-primary mb-4 flex w-full items-center
            space-x-1 rounded-lg border border-gray-300 px-2 py-1 focus-within:ring-2"
        >
          <Search className="text-gray-500 h-5 w-5" />
          <input
            type="text"
            placeholder="Search a name, barcode, or tracking number here..."
            value={searchTerm}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSearch();
              }
            }}
            onChange={handleChange}
            className="ml-2 w-full focus:outline-none text-lg py-2"
          />
        </div>

        {/* Main Content */}
        {manifestData.length > 0 ? (
          <div className="w-full space-y-6">
          {/* Tabs */}
          <div className="flex space-x-2 mb-4 overflow-x-auto">
            {shipmentTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={clsx(
                  "px-4 py-2 rounded-lg text-sm font-semibold border transition duration-300 cursor-pointer",
                  activeTab === tab
                    ? "bg-red-800 text-white"
                    : "bg-white text-black font-semibold border-gray-300 hover:bg-gray-100"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
    
          {/* Deliveries */}
          <div className="space-y-6">
            {filteredManifest.map((item) => (
              <div
                key={item.delivery_id}
                className="border rounded-lg p-6 shadow-sm bg-white"
              >
                <div className="space-y-2">
                  <div className="flex gap-4 flex-wrap">
                    <p>
                      <strong className="text-black font-semibold">Shipment Number:</strong>{" "}
                      {item.shipments.shipment_number}
                    </p>
                    <p>
                      <strong className="text-black font-semibold">Container Number:</strong>{" "}
                      {item.shipments.container_number}
                    </p>
                    <p>
                      <strong className="text-black font-semibold">Tracking Number:</strong>{" "}
                      {item.tracking_number}
                    </p>
                  </div>
                  <div className="flex gap-4 flex-wrap">
                    <label className="text-sm">
                      <strong className="text-black font-semibold">Barcode:</strong>{" "}
                      <input
                        value={item.barcode_no || ""}
                        onChange={(e) => handleFieldChange(item.delivery_id, "barcode_no", e.target.value)}
                        className="border px-2 py-1 rounded w-32"
                      />
                    </label>
                    <label className="text-sm">
                      <strong className="text-black font-semibold">No. of Boxes:</strong>{" "}
                      <input
                        type="number"
                        value={item.qty || ""}
                        onChange={(e) => handleFieldChange(item.delivery_id, "qty", e.target.value)}
                        className="border px-2 py-1 rounded w-24"
                      />
                    </label>
                  </div>
                </div>
    
                <hr className="my-4 text-gray-400" />
    
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Shipper & Consignee */}
                  <div className="space-y-2">
                    {[
                      ["Shipper", "shipper_name"],
                      ["Shipper Contact", "shipper_ctc"],
                      ["Consignee", "consignee"],
                      ["Consignee Contact", "consignee_ctc"],
                    ].map(([label, field]) => (
                      <label key={field} className="block text-sm">
                        <strong className="text-black font-semibold">{label}:</strong>{" "}
                        <input
                          value={item[field] || ""}
                          onChange={(e) => handleFieldChange(item.delivery_id, field, e.target.value)}
                          className="border px-2 py-1 rounded w-full"
                        />
                      </label>
                    ))}
                  </div>
    
                  {/* Address & Destination */}
                  <div className="">
                    {[
                      ["Address", "consignee_address"],
                      ["City", "city"],
                      ["Province", "province"],
                      ["Region", "region"],
                      ["Destination", "destination"],
                    ].map(([label, field]) => (
                      <label key={field} className="block text-sm">
                        <strong className="text-black font-semibold">{label}:</strong>{" "}
                        <input
                          value={item[field] || ""}
                          onChange={(e) => handleFieldChange(item.delivery_id, field, e.target.value)}
                          className="border px-2 py-1 rounded w-full"
                        />
                      </label>
                    ))}
                  </div>
    
                  {/* Delivery & Agent Info */}
                  <div className="">
                    {[
                      ["Agent", "agent"],                      
                      ["Received By", "received_by"],
                      ["Date Out for Delivery", "date_out_for_delivery"],
                      ["Date Received", "date_received"],
                    ].map(([label, field]) => (
                      <label key={field} className="block text-sm">
                        <strong className="text-black font-semibold">{label}:</strong>{" "}
                        <input
                          value={item[field] || ""}
                          onChange={(e) => handleFieldChange(item.delivery_id, field, e.target.value)}
                          className="border px-2 py-1 rounded w-full"
                        />
                      </label>
                    ))}
                  </div>                  
                </div>

                <button
                  onClick={handleSubmit}
                  className="px-4 py-1 bg-primary hover:bg-primary-60 text-white rounded-lg my-2 cursor-pointer">
                  Update
                </button>
              </div>
            ))}
          </div>
        </div>
        ) : (
          <div
            {...getRootProps()}
            className={clsx(
              "rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer w-full h-full border-2",
              isDragActive
                ? "border-dashed border-blue-500 bg-blue-100"
                : "border-gray-300"
            )}
          >
            <input {...getInputProps()} />
            {isDragActive && (
              <UploadCloud className="h-12 w-12 text-gray-500" />
            )}
            <p className="text-gray-600 mt-2 text-center">
              Search a barcode, name, or tracking number to display the record
              here.
            </p>
            <p className="text-gray-400 mt-2 text-center">
              Note: Drag & Drop or Click here to upload the manifest Excel to
              the database
            </p>
          </div>
        )}
      </div>     
    </div>
    
  );
};

export default Manifest;
