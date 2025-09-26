import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLoading } from "../context/useLoading";

import toast from "react-hot-toast";
import { ChevronDown, FileSpreadsheet, Eye, Trash, Search } from "lucide-react";

import DataTable from "react-data-table-component";

import {
  getDeliveries,
  getRecentManifest,
  exportToExcel,
} from "../api/manifest";

import { Status, Shipments, SearchBar } from "./filters";


const columns = [ 
  {
    name: "Actions",
    cell: (row) => (
      <div className="flex gap-2 justify-center items-center">
        <button
          className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
          onClick={() => alert(`Viewing ${row.tracking_number}`)}
        >
          <Eye size={14} />
        </button>
        <button
          className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
          onClick={() => alert(`Deleting ${row.tracking_number}`)}
        >
          <Trash size={14} />
        </button>
      </div>
    ),
    ignoreRowClick: true,
    allowOverflow: true,
    button: true,
    width: "120px",
  },
  {
    name: "Barcode No.",
    selector: (row) => row.barcode_no || "No barcode no.",
  },
  {
    name: "Tracking No.",
    selector: (row) => row.tracking_number || "No tracking no.",
  },
  {
    name: "Sender Name",
    selector: (row) => row.shipper_name  || "No sender name",
  },
  {
    name: "Sender Contact",
    selector: (row) => row.shipper_ctc || "No sender contact",
  },
  {
    name: "Consignee",
    selector: (row) => row.consignee || "No consignee name",
  },
  {
    name: "Consignee Address",
    selector: (row) => row.consignee_address || "No consignee address",
  },
  {
    name: "Consignee Contact",
    selector: (row) => row.consignee_ctc || "No consignee contact",
  },
  {
    name: "Destination",
    selector: (row) => row.destination || "No destination",
  },
  {
    name: "# of Boxes",
    selector: (row) => row.qty || "No # of boxes",
    sortable: true,
  },
  {
    name: "Status",
    selector: (row) => row.status || "No status yet",    
    style: {
      position: "sticky",
      right: 0,
      minWidth: "120px",
      backgroundColor: "white",
    },
  },
];


const ManifestTable = ({ isFull }) => {
  const navigate = useNavigate();
  const [filterText, setFilterText] = useState("");
  const [shipmentNumber, setShipmentNumber] = useState(null);
  const [shipmentNumbers, setShipmentNumbers] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");  
  const [deliveries, setDeliveries] = useState([]);  
  const [rowLimit, setRowLimit] = useState(300);
  const { setLoading } = useLoading();

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
    exportToExcel(shipmentNumber)
      .then(() => {
        toast.success(`${shipmentNumber} manifest exported to excel.`);
      })
      .catch((error) => {
        toast.error(error.message || "Export failed");
      })
      .finally(() => setLoading(false));
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
