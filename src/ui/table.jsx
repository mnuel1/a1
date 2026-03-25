import { useState, useEffect } from "react";
import { useAuth } from "../context/useAuth";
import { useLoading } from "../context/useLoading";
import { useModal } from "../context/useModal";
import { useStatusShipment } from "../context/useStatusShipment";
import { updateDelivery, updateShipment, createDelivery, insertDeliveryBoxes } from "../api/manifest";

import toast from "react-hot-toast";
import { ChevronDown, ChevronRight, FileSpreadsheet, PlusIcon } from "lucide-react";

import DataTable from "react-data-table-component";

import { buildColumns, submitManifestEdits, submitManifestCreate, applyFieldChange } from "../utils/helper";

import {
  getDeliveries,
  exportToExcel,
} from "../api/manifest";

import { Status, Shipments, SearchBar } from "./filters";
import CardManifest from "./cardManifest";
import ExpandedRow from "./expandedRow";

const ManifestTable = () => {
  const { can, getRestrictions, getSettings } = useAuth()
  const {
    shipmentNumber,
    shipmentNumbers,
    setShipmentNumber,
    statusOptions,
    selectedStatus,
    setSelectedStatus,
  } = useStatusShipment();
  const { setLoading } = useLoading();
  const { showModal } = useModal();
  const [editedData, setEditedData] = useState({});
  const [filterText, setFilterText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(filterText);

  const [deliveries, setDeliveries] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [modalMode, setModalMode] = useState("view"); // 'view' or 'edit'

  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);

  const rowLimit = 25

  const columns = buildColumns(getSettings().columns.values ?? [], (row, action) => {
    setEditedData({});
    setSelectedDelivery(row);
    setModalMode(action); // 'view' or 'edit'

  }, can('edit'));

  useEffect(() => {
    setPage(1);
  }, [filterText, selectedStatus, shipmentNumber]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(filterText);
    }, 500); // 500ms delay

    return () => clearTimeout(timeout);
  }, [filterText]);

  useEffect(() => {
    const restrictions = getRestrictions();
    setLoading(true)
    if (selectedStatus && shipmentNumber) {
      getDeliveries(
      {
        status: selectedStatus,
        shipment_number: shipmentNumber,
        search: debouncedSearch
      },
      page,
      rowLimit,
      restrictions
    )
      .then(({ data, totalCount }) => {   
        setDeliveries(data);
        setTotalRows(totalCount);
      })
      .catch((err) => {
        console.error(err);
        toast.error("We can't get the database right now. Please try again later ")
      })
      .finally(() => {
        setLoading(false);
      });
    }
  }, [selectedStatus, shipmentNumber, debouncedSearch, page]);

  const handleExport = async () => {
    if (!shipmentNumber || shipmentNumber === 'All') {
      toast.error("Please select a shipment number first.");
      return;
    }

    setLoading(true);

    const result = await exportToExcel(shipmentNumber, getSettings().columns.values ?? [])
    console.log(result);
    
    if (!result) {
      toast.error("We can't export it.");
    }

    toast.success(`${shipmentNumber} manifest exported to excel.`);
    setLoading(false)
  };

  const handleAddDelivery = async () => {

    const match = shipmentNumbers.find(
      s => s.shipment_number === shipmentNumber
    );

    if (match) {
      const { shipment_number: shipmentno, container_number: containerno } = match;
      console.log(shipmentno, containerno);
      
      setEditedData({});
      setSelectedDelivery({
        delivery_id: "new",
        shipment_number: shipmentno,
        container_number: containerno,
        tracking_number: "",
        qty: "0",
        agent: "",
        shipper_name: "",
        shipper_ctc: "",
        consignee: "",
        consignee_address: "",
        consignee_ctc: "",
        received_by: "",
        destination: "",
        date_out_for_delivery: null,
        date_received: null,
        city: "",
        delivered_qty: null,
        delivery_boxes: [
          {
            box_id: 1,
            status: "NONE",
            barcode: ""
          }
        ]
      });
      setModalMode("create");
    }
  }

  const handleModalFieldChange = (id, key, value) => {

    if (modalMode != "edit" && modalMode != "create") return;

    const boxMatch = key.match(/^box_(\d+)_(barcode|status)$/);

    if (boxMatch) {
      const [, boxId, boxField] = boxMatch;
      const numericBoxId = Number(boxId);

      setSelectedDelivery(prev => ({
        ...prev,
        delivery_boxes: (prev.delivery_boxes ?? []).map(box =>
          box.box_id === numericBoxId
            ? { ...box, [boxField]: value }
            : box
        ),
      }));

      applyFieldChange({
        deliveryId: id,
        field: key,
        value,
        setEditedData
      });
      return;
    }

    setSelectedDelivery(prev => ({
      ...prev,
      [key]: value,
    }));

    applyFieldChange({
      deliveryId: id,
      field: key,
      value,
      setEditedData
    });
  };

  const handleModalSubmit = async () => {

    if (modalMode === 'create') {
      await submitManifestCreate({
        selectedDelivery,
        createDelivery,
        updateShipment,
        insertDeliveryBoxes,
        setLoading,
        toast,
        onSuccess: () => {
          setSelectedDelivery(null);
          setEditedData({});
        },
      });
      return
    }

    await submitManifestEdits({
      editedData,
      updateDelivery,
      setLoading,
      toast,
      onSuccess: () => {
        if (!selectedDelivery) return;

        const deliveryId = selectedDelivery.delivery_id;
        const edits = editedData;

        setDeliveries(prev =>
          prev.map(d => {
            if (d.delivery_id !== deliveryId) return d;
            let updatedDelivery = { ...d, ...edits };

            if (edits.delivery_boxes) {
              const mergedBoxes = (d.delivery_boxes ?? []).map(box => {
                const editedBox = edits.delivery_boxes.find(
                  b => b.box_id === box.box_id
                );
                return editedBox ? { ...box, ...editedBox } : box;
              });

              const newBoxes = edits.delivery_boxes.filter(
                b => !mergedBoxes.some(mb => mb.box_id === b.box_id)
              );

              updatedDelivery.delivery_boxes = [...mergedBoxes, ...newBoxes];
            }

            return updatedDelivery;
          })
        );
        
        console.log(editedData, deliveries);
        

        setEditedData({});
        setSelectedDelivery(null);
      },
    });
  };

  const handleEditShipment = (shipment) => {
    let shipmentNo = shipment.shipment_number;
    let containerNo = shipment.container_number;

    showModal({
      title: "Edit Shipment",
      content: (
        <div className="flex  gap-3">
          <div className="flex flex-col">
            <strong>Shipment Number</strong>
            <input
              defaultValue={shipmentNo}
              className="border px-2 py-1 rounded"
              onChange={(e) => (shipmentNo = e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <strong>Container Number</strong>
            <input
              defaultValue={containerNo}
              className="border px-2 py-1 rounded"
              onChange={(e) => (containerNo = e.target.value)}
            />
          </div>
        </div>
      ),
      confirmText: "Save",
      onConfirm: async () => {
        if (!shipmentNo || !containerNo) {
          toast.error("Both fields are required.");
          return;
        }

        try {
          setLoading(true);

          await updateShipment({
            id: shipment.shipment_number,
            shipment_number: shipmentNo,
            container_number: containerNo,
            qtyUpd: false
          });

          toast.success("Shipment updated!");

          window.location.reload()

        } catch (err) {
          console.error(err);
          toast.error("Failed to update shipment");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex flex-col lg:flex-row justify-between w-full gap-2">
        <div className="flex items-center w-full gap-2 mb-4">
          <SearchBar label="Search" value={filterText} onChange={setFilterText} />
          <Status label="Status" value={selectedStatus} onChange={setSelectedStatus} options={statusOptions} />
          <Shipments
            value={shipmentNumber}
            options={shipmentNumbers}
            label="Shipment No."
            onChange={setShipmentNumber}
            onEdit={handleEditShipment}
          />
        </div>

        <div className="flex items-center gap-2">
          {/* disabled for now */}
          {/* {can('create') && <button
            className="flex gap-2 w-full bg-primary px-3 py-2 text-white rounded-lg whitespace-nowrap cursor-pointer hover:bg-primary-60"
            onClick={handleAddDelivery}
          >
            <PlusIcon /> Add delivery
          </button>} */}

          {can('export') && <button
            className="flex gap-2 w-full text-black border border-primary px-3 py-2 rounded-lg whitespace-nowrap cursor-pointer hover:border-primary-60 hover:text-primary-60"
            onClick={handleExport}
          >
            <FileSpreadsheet /> Export to Excel
          </button>}
        </div>
      </div>
      <div className="flex flex-col h-[700px]">
        <div className="bg-yellow-400 w-full p-2 sticky top-0 z-20 rounded-md">
          <div className="flex w-full items-center text-sm">
            Click the
            <p className="w-fit font-bold text-gray  -500">
              <ChevronRight />
            </p>
            to see the
            <strong className="mx-1"> barcodes </strong> and their <strong className="mx-1"> status </strong>.
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <DataTable
            columns={columns}
            data={deliveries}
            pagination
            paginationServer   // 🔥 IMPORTANT
            paginationTotalRows={totalRows}
            paginationPerPage={rowLimit}
            onChangePage={(page) => setPage(page)}
            highlightOnHover
            sortIcon={<ChevronDown />}
            persistTableHead
            expandableRows
            expandableRowsComponent={ExpandedRow} // if you want the row details
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
      {selectedDelivery && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-lg max-w-7xl w-full max-h-[90vh] overflow-auto relative">

            <CardManifest
              settings={getSettings().columns.values ?? []}
              deliveries={[selectedDelivery]}
              status={statusOptions}
              isReadOnly={modalMode === "view"}
              canEdit={can("edit")}
              handleFieldChange={handleModalFieldChange}
              handleSubmit={handleModalSubmit}
              isCreate={modalMode === "create"}
              isModalView={true}
              modalClose={() => {
                setSelectedDelivery(null);
                setEditedData({});
              }}
            />

          </div>
        </div>
      )}


    </div>

  );
};

export default ManifestTable;
