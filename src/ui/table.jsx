import { useState, useEffect } from "react";
import { useAuth } from "../context/useAuth";
import { useLoading } from "../context/useLoading";
import { updateDelivery } from "../api/manifest";

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
import CardManifest from "./cardManifest";

const ManifestTable = ({ isFull }) => {
  const { can, getRestrictions, getSettings } = useAuth()
  const [editedData, setEditedData] = useState({});
  const [filterText, setFilterText] = useState("");
  const [shipmentNumber, setShipmentNumber] = useState(null);
  const [shipmentNumbers, setShipmentNumbers] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [deliveries, setDeliveries] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [modalMode, setModalMode] = useState("view"); // 'view' or 'edit'

  const rowLimit = 300
  const { setLoading } = useLoading();

  const columns = buildColumns(getSettings().columns.values ?? [], (row, action) => {
    setSelectedDelivery(row);
    setModalMode(action); // 'view' or 'edit'
  }, can('edit'));


  const status = getSettings().delivery_status.values ?? []

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
    const restrictions = getRestrictions();
    setLoading(true)

    getDeliveries(
      {
        status: selectedStatus,
        shipment_number: shipmentNumber
      },
      1,
      rowLimit,
      restrictions
    ).then(({ data }) => {
      setDeliveries(data);

      setLoading(false)
    });
  }, [selectedStatus, shipmentNumber]);

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
          <Status label="Status" onChange={setSelectedStatus} options={status} />
          <Shipments
            value={shipmentNumber}
            options={shipmentNumbers}
            label="Shipment No."
            onChange={setShipmentNumber}
          />
        </div>
        <div className="flex items-center">
          { can('export') && <button
            className="flex gap-2 w-full bg-primary px-3 py-2 text-white rounded-lg whitespace-nowrap cursor-pointer hover:bg-primary-60"
            onClick={handleExport}
          >
            <FileSpreadsheet /> Export to Excel
          </button> }
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
      {selectedDelivery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-auto relative">
            <button
              className="absolute top-2 right-4 text-red-500 hover:text-red-700 px-2 py-1 rounded-full text-2xl font-bold cursor-pointer"
              onClick={() => setSelectedDelivery(null)}
            >
              ✕
            </button>

            <CardManifest
              settings={getSettings().columns.values ?? []}
              deliveries={[selectedDelivery]}
              status={status}
              isReadOnly={modalMode === "view"}
              canEdit={can("edit")}
              handleFieldChange={(id, key, value) => {
                if (modalMode === "edit") {
                  // Only update selectedDelivery for modal display
                  setSelectedDelivery(prev => ({ ...prev, [key]: value }));

                  // Track edits separately
                  setEditedData(prev => ({
                    ...prev,
                    [id]: {
                      ...prev[id],
                      [key]: value,
                    },
                  }));
                }
              }}
              handleSubmit={async () => {
                if (!selectedDelivery) return;

                const updates = editedData[selectedDelivery.delivery_id];
                if (!updates || Object.keys(updates).length === 0) {
                  toast("No changes to save.");
                  return;
                }

                try {
                  setLoading(true);
                  const response = await updateDelivery(selectedDelivery.delivery_id, updates);

                  if (response.error) throw response.error;

                  // Apply changes to main deliveries only after successful update
                  setDeliveries(prev =>
                    prev.map(d =>
                      d.delivery_id === selectedDelivery.delivery_id
                        ? { ...d, ...updates }
                        : d
                    )
                  );

                  toast.success("Delivery updated successfully!");
                  setEditedData(prev => {
                    const copy = { ...prev };
                    delete copy[selectedDelivery.delivery_id];
                    return copy;
                  });
                  setSelectedDelivery(null); // close modal
                } catch (err) {
                  console.error(err);
                  toast.error("Update failed!");
                } finally {
                  setLoading(false);
                }
              }}
            />
          </div>
        </div>
      )}


    </div>

  );
};

export default ManifestTable;
