  import clsx from "clsx"
  import { UploadCloud } from "lucide-react"

  import { useDropzoneExcel } from "../../hooks/dropzone"
  import { useLoading } from "../../context/useLoading"
  import { useModal } from "../../context/useModal"
  import { useAuth } from "../../context/useAuth"
  import { useToast } from "../../context/useToast"
  import { FileUploadService } from "./service/fileupload"

  import { useManifest } from "./hooks/useManifest"
  import { useManifestSearch } from "./hooks/useManifestSearch"

  import ManifestSearch from "./ui/manifestSearch"
  import CardManifest from "../../ui/cardManifest"

  const ManifestPage = () => {
    const { can, getRestrictions, getSettings } = useAuth()
    const { showModal } = useModal()
    const toast = useToast()
    const { setLoading } = useLoading()

    const settings = getSettings()?.columns?.values ?? []
    const deliveryStatusOptions = getSettings()?.delivery_status?.values ?? []

    const search = useManifestSearch(getRestrictions)
    const manifest = useManifest({ toast, setLoading })

    const handleFileDrop = async (file, sheetNames) => {
      await FileUploadService({ showModal, toast, setLoading, file, sheetNames })
    }

    const { getRootProps, getInputProps, isDragActive } =
      useDropzoneExcel(setLoading, handleFileDrop)

    const handleSelectResult = (id) => {
      manifest.selectSearchResult(id, search.searchResults)
      search.clearSearch()
    }
    
    return (
      <div className="flex h-full w-full bg-gray-50">
        <div className="relative flex h-full w-full flex-col p-6 bg-white shadow-md rounded-lg">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-3xl font-bold text-gray-800">Manifest</h2>
          </div>

          <ManifestSearch
            searchTerm={search.searchTerm}
            setSearchTerm={search.setSearchTerm}
            searchResults={search.searchResults}
            showResults={search.showResults}
            setShowResults={search.setShowResults}
            isFetching={search.isFetching}
            handleSearch={search.handleSearch}
            onSelect={handleSelectResult}
          />

          {manifest.manifestData ? (
            <div className="w-full space-y-6">
              <CardManifest
                settings={settings}
                manifestData={manifest.manifestData}
                handleFieldChange={can("edit") ? manifest.handleFieldChange : undefined}
                handleSubmit={can("edit") ? manifest.handleSubmit : undefined}
                deliveryStatusOptions={deliveryStatusOptions}
                canEdit={can("edit")}
                boxBreakdownShow={true}
              />
            </div>
          ) : (
            can("create") && (
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
                {isDragActive && <UploadCloud className="h-12 w-12 text-gray-500" />}
                <p className="text-gray-600 mt-2 text-center">
                  Search a barcode, name, or tracking number to display the record here.
                </p>
                <p className="text-gray-400 mt-2 text-center">
                  Note: Drag & Drop or Click here to upload the manifest Excel to the database
                </p>
              </div>
            )
          )}
        </div>
      </div>
    )
  }

  export default ManifestPage;