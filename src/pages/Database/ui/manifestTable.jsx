// ui/table/ManifestTable.jsx
import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import DataTable from "react-data-table-component"

import { useAuth } from "../../../context/useAuth"
import { useLoading } from "../../../context/useLoading"
import { useModal } from "../../../context/useModal"
import { useStatusShipment } from "../../../context/useStatusShipment"
import { useToast } from "../../../context/useToast"
import { useDeliveries } from "../hooks/useDeliveries"
import { useTableModal } from "../hooks/useTableModal"

import { exportToExcel } from "../services/excel"
import { updateShipment } from "../api/shipment"
import { buildColumns } from "../../../utils/helper"
import { editShipmentModal } from "../../../ui/modals"

import TableToolbar from "./tableToolBar"
import ExpandedRow from "./expandedRow"
import CardManifest from "../../../ui/cardManifest"

import { TABLE_STYLES } from "../constants/TABLE_STYLES"

const ManifestTable = () => {
  const { can, getRestrictions, getSettings } = useAuth()
  const { setLoading } = useLoading()
  const { showModal } = useModal()
  const toast = useToast()

  const {
    shipmentNumber,
    shipmentNumbers,
    setShipmentNumber,
    statusOptions,
    selectedStatus,
    setSelectedStatus,
  } = useStatusShipment()

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")

  const settings = getSettings().columns.values ?? []
  const deliveryStatusOptions = getSettings()?.delivery_status?.values ?? []

  // ─── Data ────────────────────────────────────────────────────────────────
  const { deliveries, totalRows, isFetching, ROW_LIMIT, queryKey } = useDeliveries({
    status: selectedStatus,
    shipmentNumber,
    search,
    page,
    restrictions: getRestrictions(),
  })

  setLoading(isFetching)

  // ─── Modal ───────────────────────────────────────────────────────────────
  const {
    selectedDelivery,
    modalMode,
    openModal,
    closeModal,
    handleFieldChange,
    handleSubmit,
  } = useTableModal({ toast, setLoading, queryKey })

  // ─── Columns — openModal matches (row, action) signature ─────────────────
  const columns = buildColumns(settings, openModal, can("edit"))

  // ─── Handlers ────────────────────────────────────────────────────────────
  const handleExport = async () => {
    if (!shipmentNumber || shipmentNumber === "All") {
      toast.error("Export failed", "Please select a shipment number first.")
      return
    }
    setLoading(true)
    const ok = await exportToExcel(shipmentNumber, settings)
    if (!ok) toast.error("We can't export it.")
    else toast.success(`${shipmentNumber} manifest exported`, `You can download the excel file now.`)
    setLoading(false)
  }

  const handleEditShipment = (shipment) =>
    editShipmentModal({ showModal, toast, setLoading, shipment, updateShipment })

  const handleStatusChange = (val) => { setSelectedStatus(val); setPage(1) }
  const handleShipmentChange = (val) => { setShipmentNumber(val); setPage(1) }

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="flex h-full w-full flex-col">

      <TableToolbar
        selectedStatus={selectedStatus}
        onStatusChange={handleStatusChange}
        statusOptions={statusOptions}
        shipmentNumber={shipmentNumber}
        shipmentNumbers={shipmentNumbers}
        onShipmentChange={handleShipmentChange}
        onShipmentEdit={handleEditShipment}
        onSearchChange={(debounced) => { setSearch(debounced); setPage(1) }}
        canExport={can("export")}
        onExport={handleExport}
      />

      <div className="flex flex-col h-[700px]">
        <div className="bg-yellow-400 w-full p-2 sticky top-0 z-20 rounded-md">
          <div className="flex w-full items-center text-sm">
            Click the
            <span className="w-fit font-bold text-gray-500">
              <ChevronRight />
            </span>
            to see the <strong className="mx-1">barcodes</strong> and their{" "}
            <strong className="mx-1">status</strong>.
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <DataTable
            columns={columns}
            data={deliveries}
            pagination
            paginationServer
            paginationTotalRows={totalRows}
            paginationPerPage={ROW_LIMIT}
            onChangePage={setPage}
            highlightOnHover
            sortIcon={<ChevronDown />}
            persistTableHead
            expandableRows
            expandableRowsComponent={ExpandedRow}
            customStyles={TABLE_STYLES}
          />
        </div>
      </div>

      {/* Modal */}
      {selectedDelivery && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-lg max-w-7xl w-full max-h-[90vh] overflow-auto relative">
            <CardManifest
              settings={settings}
              manifestData={selectedDelivery}
              deliveryStatusOptions={deliveryStatusOptions}
              isReadOnly={modalMode === "view"}
              canEdit={can("edit")}
              handleFieldChange={handleFieldChange}
              handleSubmit={handleSubmit}
              isModalView
              modalClose={closeModal}
            />
          </div>
        </div>
      )}

    </div>
  )
}

export default ManifestTable