<script lang="ts">
	import { enhance } from '$app/forms';
    import type { ActionData } from './$types';
    import { writable } from 'svelte/store';

    import * as XLSX from 'xlsx';
    import { Search, Plus } from '@lucide/svelte';
    import { dropzone } from '@sveu/actions';
    import { showToast } from '../../stores/toast';
    

    let overDropzone = writable(false);
	let resultData: any = writable({});
	let searchQuery = '';
    let found = writable(false)

    let { form }: { form: ActionData } = $props();
	
	function hover(data: CustomEvent<boolean>) {
		overDropzone.set(data.detail);
	}

	async function upload(data: any[]) {
		try {
			const response = await fetch('/manifest/api', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ manifestData: data })
			});

			if (response.ok) {
				showToast('Manifest excel uploaded successfully!', 'success');
			} else {
				showToast('Failed to upload data.', 'error');
			}
		} catch (error) {
			console.error('Upload error:', error);
			showToast('Something went wrong during upload.', 'error');
		}
	}

	async function onFileDrop(data: CustomEvent<File[]>) {
		const files = data.detail;
        let filesData;
		if (files && files.length > 0) {
			const file = files[0];

			if (file.name.endsWith('.xlsx')) {
				try {
					const excelData = await readExcelFile(file);
					filesData = excelData;

					// Initialize variables
					let shipmentNo = '';
					let containerNo = '';
					let totalBoxes = '';

					filesData = excelData.filter((row) => {
						const rowValues = Object.values(row).map((value) => value?.toString().trim());
						let shouldRemove = false;

						rowValues.forEach((value, index) => {
							if (value?.startsWith('SHIPMENT NUMBER :')) {
								shipmentNo = rowValues[index + 1]?.toString().trim() || '';
								shouldRemove = true;
							} else if (value?.startsWith('CONTAINER NUMBER :')) {
								containerNo = rowValues[index + 1]?.toString().trim() || '';
								shouldRemove = true;
							} else if (value?.startsWith('TOTAL NUMBER OF BOXES :')) {
								totalBoxes = rowValues[index + 1]?.toString().trim() || '';
								shouldRemove = true;
							} else if (value?.startsWith('CONTENTS')) {
                                shouldRemove = true;
                            }
						});

						return !shouldRemove; // Keep the row if shouldRemove is false
					});
                    
					// Check if required fields are extracted
					if (shipmentNo && containerNo) {
						const data: any = {
							manifestData: filesData,
							shipmentNo,
							containerNo,
							totalBoxes
						};
						await upload(data);
					} else {
						showToast('SHIPMENT NUMBER or CONTAINER NUMBER not found.', 'error');
					}
				} catch (error) {
					console.log(error);
					showToast('Something went wrong. File cannot be read.', 'error');
				}
			} else {
				showToast('Invalid file format. Please upload an Excel file.', 'error');
			}
		}
	}

	async function readExcelFile(file: File): Promise<any[]> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = (e) => {
				try {
					const data = new Uint8Array(e.target?.result as ArrayBuffer);
					const workbook = XLSX.read(data, { type: 'array' });
					const sheetName = workbook.SheetNames.find(name => name.startsWith("PINOY CARGO"));
					const sheet = workbook.Sheets[sheetName];

					const jsonData = XLSX.utils.sheet_to_json(sheet);
					resolve(jsonData);
				} catch (error) {
					reject(error);
				}
			};
			reader.readAsArrayBuffer(file);
		});
	}


    $effect(() => {
		if (form?.searchResult) {
			resultData.set(form?.searchResult)
		}
        if (form?.searchFound) {
			found.set(form?.searchFound)
		}
	});

</script>

<div class="flex h-full w-full">
	<div class="relative h-full w-full p-6">
        <div class="flex items-center justify-between mb-4 ">
		    <h2 class="text-2xl font-bold">  Manifest</h2>

            <button
                on:click()
                class="cursor-pointer bg-primary text-white hover:bg-primary-hover
                rounded-lg px-2 py-1 flex items-center ">
                <Plus size={20}/>
                Add Record
            </button>
        </div>
        <form 
            method="POST" 
            action="?/search"
            use:enhance 
            class="mb-4 flex items-center space-x-1 rounded-lg 
            border border-gray-300 w-full py-1 px-2 focus-within:ring-2 focus-within:ring-primary">
            <button 
                type="submit" 
                class="text-primary 
                rounded text-xs flex items-center">
                <Search size={20}/>
            </button>
            <input
                type="text"
                name="query"
                bind:value={searchQuery}
                placeholder="Search by Name, Tracking No. or Barcode..."
                class="outline-none w-full border-0 focus:ring-0
                p-2 text-xs"
            />
        </form>

		<h3 class="px-1 text-sm text-red-700">
			Note: Drag and drop the manifest Excel file to upload and add the new manifest to the
			database.
		</h3>

		<div
			use:dropzone
			on:hover={hover}
			on:files={onFileDrop}
			class="relative mt-4 min-h-screen w-full rounded-xl p-4 transition-all duration-300"
		>
		    {#if $overDropzone}
				<div
					class="bg-opacity-50 absolute inset-0 flex
                    items-center justify-center border-4 border-dashed border-gray-700/50
                    bg-gray-100/50 transition-opacity duration-300"
				>
					<p class="animate-pulse text-lg font-semibold text-black">Drop Excel File</p>
				</div>
		    {/if}
            
			{#if $resultData.results?.length}
                <form
                    action="?/search"
                    method="POST"
                    class="mt-4 space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all"
                >
                    <!-- Hidden Inputs -->
                    <input type="hidden" name="deliveryId" value="{$resultData.results[0].delivery.deliveryId}" />
                    <input type="hidden" name="shipmentId" value="{$resultData.results[0].delivery.shipmentId}" />

                    <!-- Shipment & Container Info -->
                    <div class="flex justify-between items-center text-sm">
                        <div>
                            <label class="font-bold">Shipment No: </label>
                            <input
                                type="text"
                                name="shipmentNumber"
                                class="bg-yellow-300 text-sm px-2 py-1 rounded"
                                value="{$resultData.results[0].shipmentNumber || 'N/A'}"
                            />
                        </div>
                        <div>
                            <label class="font-bold">Container No: </label>
                            <input
                                type="text"
                                name="containerNumber"
                                class="bg-yellow-300 text-sm px-2 py-1 rounded"
                                value="{$resultData.results[0].containerNumber || 'N/A'}"
                            />
                        </div>
                    </div>

                    <!-- Sender Information -->
                    <div class="mb-4 flex flex-col gap-2">
                        <h1 class="text-lg text-primary font-medium">Sender Information</h1>
                        <hr class="border-gray-200" />
                        <div class="flex flex-col lg:flex-row gap-4">
                            <div class="flex flex-col gap-2 w-full">
                                <label class="font-bold text-xs">First Name:</label>
                                <input
                                    type="text"
                                    name="shipperFirstName"
                                    class="text-md border rounded px-2 py-1"
                                    value="{$resultData.results[0].delivery.shipperName.split(' ')[0] || 'N/A'}"
                                />
                            </div>
                            <div class="flex flex-col gap-2 w-full">
                                <label class="font-bold text-xs">Last Name:</label>
                                <input
                                    type="text"
                                    name="shipperLastName"
                                    class="text-md border rounded px-2 py-1"
                                    value="{$resultData.results[0].delivery.shipperName.split(' ')[1] || 'N/A'}"
                                />
                            </div>
                            <div class="flex flex-col gap-2 w-full">
                                <label class="font-bold text-xs">Contact Number:</label>
                                <input
                                    type="text"
                                    name="shipperCtc"
                                    class="text-md border rounded px-2 py-1"
                                    value="{$resultData.results[0].delivery.shipperCtc || 'N/A'}"
                                />
                            </div>
                        </div>                        
                    </div>

                    <!-- Consignee Information -->
                    <div>
                        <h1 class="text-lg text-primary font-medium">Consignee Information</h1>
                        <hr class="border-gray-200" />
                    </div>
                    <div class="flex flex-col lg:flex-row gap-2">
                        <div class="flex flex-col gap-2 w-full">
                            <label class="font-bold text-xs">Consignee Name:</label>
                            <input
                                type="text"
                                name="consignee"
                                class="text-md border rounded px-2 py-1"
                                value="{$resultData.results[0].delivery.consignee || 'N/A'}"
                            />
                        </div>
                        <div class="flex flex-col gap-2 w-full">
                            <label class="font-bold text-xs">Consignee Address:</label>
                            <input
                                type="text"
                                name="consigneeAddress"
                                class="text-md border rounded px-2 py-1"
                                value="{$resultData.results[0].delivery.consigneeAddress || 'N/A'}"
                            />
                        </div>
                        <div class="flex flex-col gap-2 w-full">
                            <label class="font-bold text-xs">Consignee Contact:</label>
                            <input
                                type="text"
                                name="consigneeCtc"
                                class="text-md border rounded px-2 py-1"
                                value="{$resultData.results[0].delivery.consigneeCtc || 'N/A'}"
                            />
                        </div>
                    </div>

                    <!-- Delivery Information -->
                    <div class="mb-4 space-y-4">
                        <div>
                            <h1 class="text-lg text-primary font-medium">Delivery Information</h1>
                            <hr class="border-gray-200" />
                        </div>
                        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <!-- Tracking No. -->
                            <div class="flex flex-col gap-2">
                                <label class="font-bold text-xs">Tracking No.:</label>
                                <input
                                    type="text"
                                    name="trackingNumber"
                                    class="text-md border rounded px-2 py-1"
                                    value="{$resultData.results[0].delivery.trackingNumber || 'N/A'}"
                                />
                            </div>
                            <!-- Barcode -->
                            <div class="flex flex-col gap-2">
                                <label class="font-bold text-xs">Barcode:</label>
                                <input
                                    type="text"
                                    name="barcodeNo"
                                    class="text-md border rounded px-2 py-1"
                                    value="{$resultData.results[0].delivery.barcodeNo || 'N/A'}"
                                />
                            </div>
                            <!-- Status -->
                            <div class="flex flex-col gap-2">
                                <label class="font-bold text-xs">Status:</label>
                                <select
                                    name="status"
                                    class="text-md border rounded px-2 py-1"
                                    value="{$resultData.results[0].delivery.status || 'Pending'}"
                                >
                                    <option value="OUT FOR DELIVERY">OUT FOR DELIVERY</option>
                                    <option value="DELIVERED">DELIVERED</option>
                                    <option value="BACKLOAD">BACKLOAD</option>
                                    <option value="PRIORITY">PRIORITY</option>
                                    <option value="NEGATIVE / FOR DOUBLE CHECKING">NEGATIVE / FOR DOUBLE CHECKING</option>
                                    <option value="HOLD">HOLD</option>
                                    <option value="DISPATCH-PROVINCE">DISPATCH-PROVINCE</option>
                                </select>
                            </div>
                            <!-- No. of Boxes -->
                            <div class="flex flex-col gap-2">
                                <label class="font-bold text-xs">No. of Boxes:</label>
                                <input
                                    type="number"
                                    name="qty"
                                    class="text-md border rounded px-2 py-1"
                                    value="{$resultData.results[0].delivery.qty || '0'}"
                                />
                            </div>
                            <!-- Agent 1 -->
                            <div class="flex flex-col gap-2">
                                <label class="font-bold text-xs">Agent 1:</label>
                                <input
                                    type="text"
                                    name="agent"
                                    class="text-md border rounded px-2 py-1"
                                    value="{$resultData.results[0].delivery.agent || 'N/A'}"
                                />
                            </div>
                            <!-- Agent 2 -->
                            <div class="flex flex-col gap-2">
                                <label class="font-bold text-xs">Agent 2:</label>
                                <input
                                    type="text"
                                    name="agent2"
                                    class="text-md border rounded px-2 py-1"
                                    value="{$resultData.results[0].delivery.agent2 || 'N/A'}"
                                />
                            </div>
                            <!-- Destination (Full width) -->
                            <div class="flex flex-col gap-2 col-span-2 md:col-span-3">
                                <label class="font-bold text-xs">Destination:</label>
                                <input
                                    type="text"
                                    name="destination"
                                    class="text-md border rounded px-2 py-1"
                                    value="{$resultData.results[0].delivery.destination || '-'}"
                                />
                            </div>
                        </div>
                    </div>

                    
                    <!-- Additional Info Section -->
                    <div class="mt-4 border-t border-gray-300 flex flex-col lg:flex-row pt-2 gap-2 text-xs ">
                        <div class="flex flex-col gap-2 w-full">
                            <label class="font-bold">Out for Delivery: </label>
                            <input
                                type="date"
                                name="dateOutForDelivery"
                                class="text-md border rounded px-2 py-1"
                                value="{$resultData.results[0].delivery.dateOutForDelivery || ''}"
                            />
                        </div>
                        
                        <div class="flex flex-col gap-2 w-full">
                            <label class="font-bold">Date Received: </label>
                            <input
                                type="date"
                                name="dateReceived"
                                class="text-md border rounded px-2 py-1"
                                value="{$resultData.results[0].delivery.dateReceived || ''}"
                            />
                        </div>
                        <div class="flex flex-col gap-2 w-full">
                            <label class="font-bold">Received By: </label>
                            <input
                                type="text"
                                name="receivedBy"
                                class="text-md border rounded px-2 py-1"
                                value="{$resultData.results[0].delivery.receivedBy || 'Not yet set.'}"
                            />
                        </div>
                    </div>

                    <!-- Submit Button -->
                    <div class="mt-6 flex justify-end">
                        <button
                            type="submit"
                            class="bg-primary text-white px-4 py-2 
                            rounded-lg hover:bg-primary-dark transition
                            cursor-pointer"
                        >
                            Update
                        </button>
                    </div>
                </form>


            {:else if !$found && $resultData.results?.length === 0}
                <div class="flex h-40 items-center justify-center text-gray-500">
                    No matching records found. Try another search.
                </div>

            {:else if searchQuery.trim() === ''}
                <div class="flex h-40 items-center justify-center text-gray-500">
                    Search to display data.
                </div>
            {/if}


		</div>
	</div>
</div>
