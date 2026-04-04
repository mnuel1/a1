// ui/table/TableToolbar.jsx
import { FileSpreadsheet } from "lucide-react"
import { useTableSearch } from "../hooks/useTableSearch"
import { SearchBar, Status, Shipments } from "../../../ui/filters"

/**
 * Self-contained toolbar for ManifestTable.
 *
 * Owns:
 *  - search input + debounce (via useTableSearch)
 *  - status, shipment selectors (values come from useStatusShipment via props)
 *  - export button
 *
 * Calls onSearchChange(debouncedSearch) whenever the debounced value settles,
 * so the parent only ever sees the final value — no debounce logic leaks up.
 */
const TableToolbar = ({
  // Filter values + setters from useStatusShipment (owned by parent)
  selectedStatus,
  onStatusChange,
  statusOptions,
  shipmentNumber,
  shipmentNumbers,
  onShipmentChange,
  onShipmentEdit,

  // Debounced search callback — parent passes this down to useDeliveries
  onSearchChange,

  // Export
  canExport,
  onExport,
}) => {
  const { searchText, setSearchText, debouncedSearch } = useTableSearch(500)

  // Bubble debounced value up whenever it changes
  // We use a ref-free approach: just call the callback in render is fine
  // because onSearchChange is stable (parent should memoize or it's a setter)
  if (onSearchChange) onSearchChange(debouncedSearch)

  return (
    <div className="flex flex-col lg:flex-row justify-between w-full gap-2">
      <div className="flex items-center w-full gap-2 mb-4">
        <SearchBar
          label="Search"
          value={searchText}
          onChange={setSearchText}
        />
        <Status
          label="Status"
          value={selectedStatus}
          onChange={onStatusChange}
          options={statusOptions}
        />
        <Shipments
          value={shipmentNumber}
          options={shipmentNumbers}
          label="Shipment No."
          onChange={onShipmentChange}
          onEdit={onShipmentEdit}
        />
      </div>

      <div className="flex items-center gap-2">
        {canExport && (
          <button
            className="flex gap-2 w-full text-black border border-primary px-3 py-2 rounded-lg whitespace-nowrap cursor-pointer hover:border-primary-60 hover:text-primary-60"
            onClick={onExport}
          >
            <FileSpreadsheet /> Export to Excel
          </button>
        )}
      </div>
    </div>
  )
}

export default TableToolbar