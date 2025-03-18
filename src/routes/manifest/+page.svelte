<script lang="ts">
    import { dropzone } from "@sveu/actions";
    import { ChevronRight, ChevronLeft } from "@lucide/svelte";
    import * as XLSX from "xlsx";
    import { showToast } from '../../stores/toast';

    let overDropzone = false;
    let filesData: any[] = []; // Holds parsed Excel data
    let filteredData: any[] = []; // Holds filtered data after search/filter
    let searchQuery = "";
    let currentPage = 1;
    const rowLimit = 5;
    let totalPages = 1;
    let selectedStatus = "";
    let sortBy = "city";

    // ✅ Mapping of cities to regions in PH
    const cityToRegionMap = {
        "Manila": "NCR",
        "Makati": "NCR",
        "Quezon City": "NCR",
        "Cebu": "Region VII",
        "Davao": "Region XI",
        "Taguig": "NCR",
        "Pasig": "NCR",
        "Baguio": "CAR",
        "Iloilo": "Region VI",
        "Zamboanga": "Region IX",
        "Cagayan de Oro": "Region X"
    };


    // ✅ Reactive block to update total pages
    $: totalPages = Math.ceil(filteredData.length / rowLimit) || 1;

    function hover(data: CustomEvent<boolean>) {
        overDropzone = data.detail;
    }

    async function on_file_drop(data: CustomEvent<File[]>) {
        const files = data.detail;

        if (files && files.length > 0) {
            const file = files[0];

            if (file.name.endsWith(".xlsx")) {
                try {
                    const excelData = await readExcelFile(file);
                    filesData = excelData;
                    applyFilters(); // Apply initial filter and sort
                    currentPage = 1; // Reset page after new file load
                } catch (error) {
                    console.log(error)
                    showToast("Something went wrong. File cannot be read", 'error');
                }
            } else {
                showToast("Invalid file format. Please upload an Excel file.", 'error');
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
        "NO.",
        "SHIPMENT NO.",
        "CONTAINER NO.",
        "TRACKING NO.",
        "NAME OF SENDER",
        "CONTACT NO.",
        "AGENT",
        "CONSIGNEE",
        "CONSIGNEE_ADDRESS",
        "CONTACT NO.",
        "BARCODE",
        "DESTINATION",
        "NO. OF BOXES",
        "STATUS"
    ];

    // ✅ Reactive block for pagination data
    $: paginatedData = getPaginatedData();

    function getPaginatedData() {
        const start = (currentPage - 1) * rowLimit;
        const end = start + rowLimit;
        return filteredData.slice(start, end);
    }

    function goToPage(page: number) {
        if (page >= 1 && page <= totalPages) {
            currentPage = page;
        }
    }

    function setStatus(status) {
      selectedStatus(status)
    }

    // ✅ Extract city from CONSIGNEE_ADDRESS
    function getCityFromAddress(address: string): string {
        const parts = address.split(",");
        return parts.length > 1 ? parts[parts.length - 2].trim() : "Unknown";
    }

    // ✅ Get region from city
    function getRegionFromCity(city: string): string {
        return cityToRegionMap[city] || "Unknown";
    }

    // ✅ Apply filters and sort
    function applyFilters() {
        let data = [...filesData];

        // Apply search
        if (searchQuery.trim() !== "") {
            data = data.filter((row) =>
                Object.values(row).some((val) =>
                    String(val).toLowerCase().includes(searchQuery.toLowerCase())
                )
            );
        }

        // Apply status filter
        if (selectedStatus) {
            data = data.filter((row) => row["STATUS"] === selectedStatus);
        }

        // Group and sort by city or region
        // data = groupAndSortData(data, sortBy);

        filteredData = data;
        currentPage = 1;
    }

    function groupAndSortData(data, key) {
        // Group by city or region and sort alphabetically
        return data.sort((a, b) => {
            let valueA = key === "CONSIGNEE_ADDRESS" ? getCityFromAddress(a["CONSIGNEE_ADDRESS"]) : getRegionFromCity(getCityFromAddress(a["CONSIGNEE_ADDRESS"]));
            let valueB = key === "CONSIGNEE_ADDRESS" ? getCityFromAddress(b["CONSIGNEE_ADDRESS"]) : getRegionFromCity(getCityFromAddress(b["CONSIGNEE_ADDRESS"]));

            if (valueA < valueB) return -1;
            if (valueA > valueB) return 1;
            return 0;
        });
    }
</script>

<div class="flex h-full w-full">
    <div class="h-full w-full relative p-6">
        <h2 class="text-2xl font-bold mb-4">Manifest</h2>

        <div class="flex items-center mb-4 space-x-4">
            <input
                type="text"
                bind:value={searchQuery}
                placeholder="Search..."
                class="p-2 w-1/3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                on:input={applyFilters}
            />
        
            <select
                bind:value={sortBy}
                on:change={applyFilters}
                class="p-2 border border-gray-300 rounded-lg focus:outline-none"
            >
                <option value="CONSIGNEE_ADDRESS">Sort by City</option>
                <option value="REGION">Sort by Region</option>
            </select>
        </div>
        <div class="flex gap-2">
        <button class="font-medium border-b border-primary cursor-pointer"> OUT FOR DELIVERY </button>
        <button class="font-medium border-b border-primary cursor-pointer"> DELIVERED </button>
        <button class="font-medium border-b border-primary cursor-pointer"> BACKLOAD </button>
        <button class="font-medium border-b border-primary cursor-pointer"> PRIORITY </button>
        <button class="font-medium border-b border-primary cursor-pointer"> NEGATIVE / FOR DOUBLE CHECKING </button>
        <button class="font-medium border-b border-primary cursor-pointer"> HOLD </button>
        <button class="font-medium border-b border-primary cursor-pointer"> DISPATCH-PROVINCE </button>
        </div>
        <div
            use:dropzone
            on:hover="{hover}"
            on:files="{on_file_drop}"
            class="relative min-h-screen mt-4 w-full p-4 rounded-xl transition-all duration-300"
        >
            <!-- Overlay animation when hovering over dropzone -->
            {#if overDropzone}
                <div class="absolute inset-0 bg-gray-100/50 bg-opacity-50 
                  flex items-center justify-center transition-opacity duration-300
                  border-4 border-dashed border-gray-700/50
                  ">
                    <p class="text-black text-lg font-semibold animate-pulse">Drop Excel File</p>
                </div>
            {/if}

            <!-- Table with parsed Excel data -->
            <table class="table-auto w-full border-collapse border border-gray-100 mt-2 rounded-lg">
                <thead class="bg-gray-100/50">
                    <tr>
                        {#each columns as col}
                            <th class="text-xs font-medium text-black p-3 text-center">
                                {col}
                            </th>
                        {/each}
                    </tr>
                </thead>

                <tbody>
                    {#if getPaginatedData().length > 0}
                        {#each getPaginatedData() as row, i}
                            <tr class="{i % 2 !== 0 ? 'bg-gray-100/50' : 'bg-white'} hover:bg-primary/10 cursor-pointer transition delay-25">
                                {#each Object.values(row) as value}
                                    <td class="text-xs font-normal text-black p-3 text-center">
                                        {value}
                                    </td>
                                {/each}
                            </tr>
                        {/each}
                    {/if}
                </tbody>
            </table>
            {#if filteredData.length <= 0}
                <div class="flex items-center justify-center h-40 text-gray-500">
                    {"There's no data yet :( . You can drop your excel file to add your records :)"}.
                </div>
            {/if}

            {#if filteredData.length > rowLimit}
                <div class="flex justify-center items-center mt-4 space-x-2">
                    <!-- Previous Page Button -->
                    <button
                        on:click={() => goToPage(Number(currentPage - 1))}
                        class="px-3 py-2 border border-gray-300 rounded-md text-xs
                        {currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary cursor-pointer'}"
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft size={10} />
                    </button>

                    <!-- Page Input Field -->
                    <input
                        type="number"
                        bind:value={currentPage}
                        on:change={() => goToPage(Number(currentPage))}
                        min="1"
                        max={totalPages}
                        class="w-10 px-2 py-1 border border-gray-300 rounded-md text-center focus:outline-none"
                    />
                    <span class="text-sm text-gray-600">/ {totalPages}</span>

                    <button
                        on:click={() => goToPage(Number(currentPage + 1))}
                        class="px-3 py-2 border border-gray-300 rounded-md text-xs 
                        {currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary cursor-pointer'}"
                        disabled={currentPage === totalPages}
                    >
                        <ChevronRight size={10} />
                    </button>
                </div>
            {/if}
        </div>
    </div>
</div>
