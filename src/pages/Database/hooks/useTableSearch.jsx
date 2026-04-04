// hooks/useTableSearch.js
import { useState, useEffect } from "react"

/**
 * Encapsulates search input + debounce logic.
 * ManifestTable only consumes `debouncedSearch` for the query.
 *
 * @param {number} delay - debounce delay in ms (default 500)
 */
export const useTableSearch = (delay = 500) => {
  const [searchText, setSearchText] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchText), delay)
    return () => clearTimeout(t)
  }, [searchText, delay])

  return {
    searchText,
    setSearchText,
    debouncedSearch,
  }
}