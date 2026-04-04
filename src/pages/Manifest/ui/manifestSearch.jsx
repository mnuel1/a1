// ui/ManifestSearch.jsx
import { useState, useEffect, useRef } from "react"
import { SearchBar } from "../../../ui/filters"

const ManifestSearch = ({
  searchTerm,
  setSearchTerm,
  searchResults,
  showResults,
  setShowResults,
  isFetching,
  handleSearch,
  onSelect,
}) => {
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const resultsRef = useRef([])

  useEffect(() => {
    if (showResults && searchResults.length > 0) setHighlightedIndex(0)
  }, [searchResults, showResults])

  const scrollToHighlighted = (index) => {
    const el = resultsRef.current[index]
    if (el) el.scrollIntoView({ block: "nearest" })
  }

  const handleKeyDown = (e) => {
    if (!showResults || searchResults.length === 0) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHighlightedIndex((prev) => {
        const next = prev < searchResults.length - 1 ? prev + 1 : 0
        scrollToHighlighted(next)
        return next
      })
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlightedIndex((prev) => {
        const next = prev > 0 ? prev - 1 : searchResults.length - 1
        scrollToHighlighted(next)
        return next
      })
    } else if (e.key === "Enter") {
      e.preventDefault()
      const item = searchResults[highlightedIndex]
      if (item) onSelect(item.delivery.delivery_id)
    }
  }

  return (
    <div className="relative" onKeyDown={handleKeyDown}>
      <SearchBar
        label=""
        placeholder="Search a shipment number-tracking number (2501-41496), name, barcode or tracking number"
        value={searchTerm}
        onChange={(value) => {
          setSearchTerm(value)
          setShowResults(true) // show results while typing
        }}
        handleOnKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            handleSearch(searchTerm)
          }
        }}
      />

      {isFetching && (
        <div className="absolute w-full bg-white border rounded-lg shadow-lg max-h-80 overflow-y-auto z-20">
          <div className="px-4 py-2 text-sm text-gray-500">Searching...</div>
        </div>
      )}

      {!isFetching && showResults && (
        <div className="absolute w-full bg-white border rounded-lg shadow-lg max-h-80 overflow-y-auto z-20">
          {searchResults.length > 0 ? (
            searchResults.map((item, index) => {
              const label = `${item.shipment.shipment_number} - ${item.delivery.tracking_number.split("/")[0]}`
              const id = item.delivery.delivery_id
              const isHighlighted = index === highlightedIndex

              return (
                <button
                  key={id}
                  ref={(el) => (resultsRef.current[index] = el)}
                  className={`w-full text-left px-4 py-2 text-sm cursor-pointer ${
                    isHighlighted ? "bg-gray-100" : ""
                  }`}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onClick={() => onSelect(id)}
                >
                  <div className="font-semibold">{label}</div>
                  <div className="text-xs text-gray-500">
                    {item.delivery.consignee} · {item.delivery.shipper_name}
                  </div>
                </button>
              )
            })
          ) : (
            <div className="px-4 py-2 text-sm text-gray-500">No results found.</div>
          )}
        </div>
      )}
    </div>
  )
}

export default ManifestSearch