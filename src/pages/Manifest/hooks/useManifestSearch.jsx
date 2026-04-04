// hooks/useManifestSearch.js
import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { searchDeliveries } from "../api/search"

// Simple debounce hook
const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

export const useManifestSearch = (getRestrictions) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [committedTerm, setCommittedTerm] = useState(null)
  const [showResults, setShowResults] = useState(false)

  const debouncedTerm = useDebounce(searchTerm, 500)

  useEffect(() => {
    const trimmed = debouncedTerm.trim()
    if (!trimmed) return
    setCommittedTerm(trimmed)
    setShowResults(true)
  }, [debouncedTerm])

  const { data: searchResults = [], isFetching } = useQuery({
    queryKey: ["manifest-search", committedTerm],
    queryFn: () => searchDeliveries(committedTerm, getRestrictions()),
    enabled: !!committedTerm,
    select: (result) => (result.searchFound ? result.searchResult : []),
  })

  const handleSearch = () => {
    const trimmed = searchTerm.trim()
    if (!trimmed) return
    setCommittedTerm(trimmed)
    setShowResults(true)
  }

  const clearSearch = () => {
    setShowResults(false)
    setSearchTerm("")
    setCommittedTerm(null)
  }

  return {
    searchTerm,
    setSearchTerm,
    searchResults,
    showResults,
    setShowResults,
    isFetching,
    handleSearch,
    clearSearch,
  }
}