import React, { useState, useEffect } from "react";
import { Search, UploadCloud } from "lucide-react";
import clsx from "clsx";

import toast from "react-hot-toast";
import { useDropzoneExcel } from "../hooks/dropzone";
import { useLoading } from "../context/useLoading";
import { searchDeliveries } from "../api/manifest";

const Manifest = () => {
  const [manifestData, setManifestData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState(null);

  const { setLoading } = useLoading();
  const { getRootProps, getInputProps, isDragActive } =
    useDropzoneExcel(setLoading);

  const handleChange = (e) => {
    const search = e.target.value;
    setSearchTerm(search);
  };

  const handleSearch = async () => {
    const result = await searchDeliveries(searchTerm);
    if (!result.searchFound) {
      toast.error("Cannot be found");
    }

    setManifestData(result.searchResult);

    if (result.searchResult.length > 0) {
      setActiveTab(result.searchResult[0].shipments.shipment_number);
    }
  };

  const shipmentTabs = Array.from(
    new Set(
      manifestData.map(
        (item) =>
          `${item.shipments.shipment_number} - ${item.barcode_no.split("/")[0]}`
      )
    )
  );

  const filteredManifest = manifestData.filter(
    (item) =>
      `${item.shipments.shipment_number} - ${item.barcode_no.split("/")[0]}` ===
      activeTab
  );

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
                    "px-4 py-2 rounded-lg text-sm font-semibold border transition duration-300",
                    activeTab === tab
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Deliveries for active tab */}
            <div className="space-y-6">
              {filteredManifest.map((item) => (
                <div
                  key={item.delivery_id}
                  className="border rounded-lg p-6 shadow-sm bg-white"
                >
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Delivery #{item.delivery_id}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Basic Info: Tracking, Barcode */}
                    <div className="space-y-2">
                      <p>
                        <strong className="text-gray-700">
                          Tracking Number:
                        </strong>{" "}
                        {item.tracking_number}
                      </p>
                      <p>
                        <strong className="text-gray-700">Barcode:</strong>{" "}
                        {item.barcode_no}
                      </p>
                      <p>
                        <strong className="text-gray-700">Quantity:</strong>{" "}
                        {item.qty}
                      </p>
                    </div>

                    {/* Shipper & Consignee */}
                    <div className="space-y-2">
                      <p>
                        <strong className="text-gray-700">Shipper:</strong>{" "}
                        {item.shipper_name}
                      </p>
                      <p>
                        <strong className="text-gray-700">
                          Shipper Contact:
                        </strong>{" "}
                        {item.shipper_ctc}
                      </p>
                      <p>
                        <strong className="text-gray-700">Consignee:</strong>{" "}
                        {item.consignee}
                      </p>
                      <p>
                        <strong className="text-gray-700">
                          Consignee Contact:
                        </strong>{" "}
                        {item.consignee_ctc}
                      </p>
                    </div>

                    {/* Address & Destination */}
                    <div className="space-y-2">
                      <p>
                        <strong className="text-gray-700">Address:</strong>{" "}
                        {item.consignee_address}
                      </p>
                      <p>
                        <strong className="text-gray-700">City:</strong>{" "}
                        {item.city}
                      </p>
                      <p>
                        <strong className="text-gray-700">Province:</strong>{" "}
                        {item.province}
                      </p>
                      <p>
                        <strong className="text-gray-700">Region:</strong>{" "}
                        {item.region}
                      </p>
                      <p>
                        <strong className="text-gray-700">Destination:</strong>{" "}
                        {item.destination}
                      </p>
                    </div>

                    {/* Delivery & Agent Info */}
                    <div className="space-y-2">
                      <p>
                        <strong className="text-gray-700">Agent:</strong>{" "}
                        {item.agent}
                      </p>
                      <p>
                        <strong className="text-gray-700">Agent2:</strong>{" "}
                        {item.agent2}
                      </p>
                      <p>
                        <strong className="text-gray-700">Received By:</strong>{" "}
                        {item.received_by}
                      </p>
                      <p>
                        <strong className="text-gray-700">
                          Date Out for Delivery:
                        </strong>{" "}
                        {item.date_out_for_delivery || "Not Set"}
                      </p>
                      <p>
                        <strong className="text-gray-700">
                          Date Received:
                        </strong>{" "}
                        {item.date_received || "Not Set"}
                      </p>
                    </div>

                    {/* Shipment Info */}
                    <div className="space-y-2">
                      <p>
                        <strong className="text-gray-700">
                          Shipment Number:
                        </strong>{" "}
                        {item.shipments.shipment_number}
                      </p>
                      <p>
                        <strong className="text-gray-700">
                          Container Number:
                        </strong>{" "}
                        {item.shipments.container_number}
                      </p>
                    </div>

                    {/* Created At */}
                    <div className="space-y-2">
                      <p>
                        <strong className="text-gray-700">Created At:</strong>{" "}
                        {new Date(item.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
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
