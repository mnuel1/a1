<script lang="ts">
    import { dropzone } from "@sveu/actions";
    import * as XLSX from "xlsx";
    import { showToast } from '../../stores/toast';

    let overDropzone = false;
    let filesData: any[] = []; // Holds parsed Excel data
    let filteredData: any[] = []; // Holds filtered data after search/filter
    let searchQuery = "";
    let hasSearched = false; // Track if a search has been performed

    function hover(data: CustomEvent<boolean>) {
        overDropzone = data.detail;
    }

    async function upload(data: any[]) {
        try {
            // Perform your upload logic here, e.g., an API request
            const response = await fetch('/manifest/api', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ manifestData: data }),
            });

            if (response.ok) {
                showToast("Data uploaded successfully!", 'success');
            } else {
                showToast("Failed to upload data.", 'error');
            }
        } catch (error) {
            console.error("Upload error:", error);
            showToast("Something went wrong during upload.", 'error');
        }
    }

    async function on_file_drop(data: CustomEvent<File[]>) {
        const files = data.detail;

        if (files && files.length > 0) {
            const file = files[0];

            if (file.name.endsWith(".xlsx")) {
                try {
                    const excelData = await readExcelFile(file);
                    filesData = excelData;

                    // Initialize variables
                    let shipmentNo = "";
                    let containerNo = "";
                    let totalBoxes = "";
                    
                    // Loop through rows to find matching labels in any column
                    for (const row of excelData) {
                        const rowValues = Object.values(row).map((value) => value?.toString().trim());
                        rowValues.forEach((value, index) => {
                            if (value?.startsWith("SHIPMENT NUMBER :")) {
                                shipmentNo = rowValues[index + 1]?.toString().trim() || "";
                            } else if (value?.startsWith("CONTAINER NUMBER :")) {
                                containerNo = rowValues[index + 1]?.toString().trim() || "";
                            } else if (value?.startsWith("TOTAL NUMBER OF BOXES :")) {
                                totalBoxes = rowValues[index + 1]?.toString().trim() || "";
                            }
                        });
                    }
                    
                    // Check if required fields are extracted
                    if (shipmentNo && containerNo) {
                        // Pass extracted values to upload
                        console.log(shipmentNo, containerNo, totalBoxes)
                        const data = {
                            manifestData: excelData,
                            shipmentNo,
                            containerNo,
                            totalBoxes,
                        }
                        await upload(data);
                        showToast("File uploaded successfully!", "success");
                    } else {
                        showToast("SHIPMENT NUMBER or CONTAINER NUMBER not found.", "error");
                    }
                } catch (error) {
                    console.log(error);
                    showToast("Something went wrong. File cannot be read.", "error");
                }
            } else {
                showToast("Invalid file format. Please upload an Excel file.", "error");
            }
        }
    }



    async function readExcelFile(file: File): Promise<any[]> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target?.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: "array" });
                    const sheetName = workbook.SheetNames[0];
                    const sheet = workbook.Sheets[sheetName];

                    // Convert sheet to JSON
                    const jsonData = XLSX.utils.sheet_to_json(sheet);
                    resolve(jsonData);
                } catch (error) {
                    reject(error);
                }
            };
            reader.readAsArrayBuffer(file);
        });
    }

    const columns = [
        "SHIPMENT NO.",
        "CONTAINER NO.",
        "TRACKING NO.",
        "NAME OF SENDER",
        "CONTACT NO.",
        "AGENT",
        "AGENT2",
        "CONSIGNEE",
        "CONSIGNEE_ADDRESS",
        "CONTACT NO.",
        "BARCODE",
        "DESTINATION",
        "NO. OF BOXES",
        "STATUS"
    ];

    function applyFilters() {
        if (searchQuery.trim() === "") {
            hasSearched = false;
            filteredData = [];
            return;
        }

        let data = [...filesData];

        // Apply search only to specific columns
        data = data.filter((row) =>
            ["NAME OF SENDER", "TRACKING NO.", "BARCODE"].some((key) =>
                String(row[key]).toLowerCase().includes(searchQuery.toLowerCase())
            )
        );

        filteredData = data;
        hasSearched = true;
    }
</script>

<div class="flex h-full w-full">
    <div class="h-full w-full relative p-6">
        <h2 class="text-2xl font-bold mb-4">Manifest</h2>

        <div class="flex items-center mb-4 space-x-4">
            <input
                type="text"
                bind:value={searchQuery}
                placeholder="Search by Name, Tracking No. or Barcode..."
                class="p-2 w-1/3 border border-gray-300 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-primary text-xs"
                on:input={applyFilters}
            />
        </div>

        <h3 class="text-sm text-red-700 px-1"> 
            Note: Drag and drop the manifest Excel file to upload and add the new manifest to the database.
        </h3>

        <div
            use:dropzone
            on:hover="{hover}"
            on:files="{on_file_drop}"
            class="relative min-h-screen mt-4 w-full p-4 rounded-xl transition-all duration-300"
        >
            <!-- Overlay animation when hovering over dropzone -->
            {#if overDropzone}
                <div
                    class="absolute inset-0 bg-gray-100/50 bg-opacity-50 
                    flex items-center justify-center transition-opacity duration-300
                    border-4 border-dashed border-gray-700/50"
                >
                    <p class="text-black text-lg font-semibold animate-pulse">
                        Drop Excel File
                    </p>
                </div>
            {/if}

            <!-- Show results only after searching -->
            {#if hasSearched && filteredData.length > 0}
                <div class="space-y-4 mt-2">
                    {#each filteredData as row, i}
                        <div
                            class="p-4 border border-gray-200 rounded-lg shadow-sm bg-white hover:bg-primary/5 transition-all"
                        >
                            <h3 class="text-lg font-semibold text-primary">
                                {row["NAME OF SENDER"] || "Unknown"}
                            </h3>
                            <p class="text-sm text-gray-500">
                                <strong>Tracking No:</strong> {row["TRACKING NO."] || "N/A"} | 
                                <strong>Barcode:</strong> {row["BARCODE"] || "N/A"}
                            </p>

                            <div class="grid grid-cols-2 gap-4 mt-3">
                                {#each columns as col}
                                    <div class="flex items-start space-x-2">
                                        <span class="font-medium text-gray-700 text-sm">{col}:</span>
                                        <span class="text-gray-600 text-sm">{row[col] || "-"}</span>
                                    </div>
                                {/each}
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}

            {#if hasSearched && filteredData.length === 0}
                <div class="flex items-center justify-center h-40 text-gray-500">
                    {"No matching records found. Try another search."}
                </div>
            {/if}

            {#if !hasSearched}
                <div class="flex items-center justify-center h-40 text-gray-500">
                    {"Search to display data."}
                </div>
            {/if}
        </div>
    </div>
</div>
