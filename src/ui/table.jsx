import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLoading } from "../context/useLoading";
import { useAuth } from "../context/useAuth";

import toast from "react-hot-toast";
import { ChevronDown, FileSpreadsheet } from "lucide-react";

import DataTable from "react-data-table-component";

import { buildColumns } from "../utils/helper";

import {
  getDeliveries,
  getRecentManifest,
  exportToExcel,
} from "../api/manifest";

import { Status, Shipments, SearchBar } from "./filters";

const ManifestTable = ({ isFull }) => {
  const { getSettings } = useAuth()  
  const [filterText, setFilterText] = useState("");
  const [shipmentNumber, setShipmentNumber] = useState(null);
  const [shipmentNumbers, setShipmentNumbers] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");  
  const [deliveries, setDeliveries] = useState([]);  
  const [rowLimit, setRowLimit] = useState(300);
  const { setLoading } = useLoading();
    
  const columns = buildColumns(getSettings().columns.values ?? [])
  
  
  useEffect(() => {
    const fetchManifests = async () => {
      const shipmentNo = await getRecentManifest();
     
      if (shipmentNo.length > 0) {
        setShipmentNumber(shipmentNo[0].shipment_number);
        setShipmentNumbers(shipmentNo);
      }
    };

    fetchManifests();
  }, []);

  useEffect(() => {
    getDeliveries(
      {
        status: selectedStatus,
        shipment_number: shipmentNumber,
      },
      1,
      rowLimit
    ).then(({ data }) => {
      setDeliveries(data);
            
    });
  }, [selectedStatus, shipmentNumber, rowLimit]);

  const handleExport = async () => {
    if (!shipmentNumber) {
      toast.error("Please select a shipment number first.");
      return;
    }
    setLoading(true);

    const result = exportToExcel(shipmentNumber, getSettings().columns.values ?? [])

    if (!result) {
        toast.error("We can't export it.");
    }

    toast.success(`${shipmentNumber} manifest exported to excel.`);
    setLoading(false)   
  };

  const filteredItems = deliveries.filter((item) => {
    const search = filterText.toLowerCase();
    return (
      item?.tracking_number?.toString().toLowerCase().includes(search) ||
      item?.shipper_name?.toLowerCase().includes(search) ||
      item?.consignee?.toLowerCase().includes(search) ||
      item?.barcode_no?.toLowerCase().includes(search)      
    );
  });

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex flex-col lg:flex-row justify-between w-full gap-2">
        <div className="flex items-center w-full gap-2 mb-4">
          <SearchBar label="Search" value={filterText} onChange={setFilterText} />
          <Status label="Status" onChange={setSelectedStatus} />
          <Shipments
            value={shipmentNumber}
            options={shipmentNumbers}
            label="Shipment No."
            onChange={setShipmentNumber}
          />
        </div>        
        <div className="flex items-center">
          <button
            className="flex gap-2 w-full bg-primary px-3 py-2 text-white rounded-lg whitespace-nowrap cursor-pointer hover:bg-primary-60"
            onClick={handleExport}
          >
            <FileSpreadsheet /> Export to Excel
          </button>
        </div>
      </div>
      <div className="relative h-[700px] overflow-x-auto">
        <DataTable        
          columns={columns}
          data={filteredItems}          
          pagination
          highlightOnHover          
          sortIcon={<ChevronDown />}
          persistTableHead
          customStyles={{
          headCells: {
            style: {
              fontWeight: "600",
              fontSize: "12px",
              backgroundColor: "#f3f4f6",
              textAlign: "center",
              justifyContent: "center"
            },
          },
          rows: {
            style: {
              fontSize: "13px",
              minHeight: "48px",
              alignItems: "center",
            },
          },
          cells: {
            style: {
              justifyContent: "center",
            },
          },         
        }}       
      />
      </div>      
    </div>
  );
};

export default ManifestTable;
