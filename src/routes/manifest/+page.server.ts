import type { RequestEvent, ActionFailure } from "@sveltejs/kit";
import type { Actions } from './$types';

import * as XLSX from "xlsx";
import { db } from "$lib/server/db";
import { shipments, deliveries } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";


export const actions: Actions = {
    upload: async ({ request }: RequestEvent): Promise<{ success?: boolean; error?: string } | ActionFailure<any>> => {
        const formData = await request.formData();
        const file = formData.get("file");

        if (!file || !(file instanceof File)) {
            return { error: "No file uploaded or invalid file format." };
        }

        try {
            const buffer = await file.arrayBuffer();
            const workbook = XLSX.read(new Uint8Array(buffer), { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet);

            if (jsonData.length === 0) {
                return { error: "Excel file is empty." };
            }

            // Process each row in the Excel file
            for (const row of jsonData) {
                // // Check if shipment already exists to prevent duplicates
                // const existingShipment = await db
                //     .select()
                //     .from(shipments)
                //     .where(eq(shipments.shipmentNumber, row["SHIPMENT NO."]))
                //     .limit(1);

                // let shipmentId;

                // if (existingShipment.length === 0) {
                //     // Insert into shipments if not already present
                //     const [newShipment] = await db
                //         .insert(shipments)
                //         .values({
                //             shipmentNumber: row["SHIPMENT NO."],
                //             containerNumber: row["CONTAINER NO."],
                //             totalBoxes: parseInt(row["NO. OF BOXES"]),
                //         })
                //         .returning({ shipmentId: shipments.shipmentId });
                    
                //     shipmentId = newShipment.shipmentId;
                // } else {
                //     shipmentId = existingShipment[0].shipmentId;
                // }

                // // Insert into deliveries using the shipmentId
                // await db.insert(deliveries).values({
                //     shipmentId: shipmentId,
                //     trackingNumber: row["TRACKING NO."],
                //     qty: parseInt(row["NO. OF BOXES"]),
                //     barcodeNo: row["BARCODE"],
                //     agent: row["AGENT"],
                //     shipperName: row["NAME OF SENDER"],
                //     shipperCtc: row["CONTACT NO."],
                //     consignee: row["CONSIGNEE"],
                //     consigneeAddress: row["CONSIGNEE_ADDRESS"],
                //     consigneeCtc: row["CONTACT NO."],
                //     destination: row["DESTINATION"],
                //     status: "Pending", // Default status
                // });
            }

            return { success: true, message: "Data inserted successfully!" } as { success?: boolean; message?: string };

        } catch (err) {
            console.error("Error inserting data:", err);
            return { error: "Error processing file or inserting data." };
        }
    },
};
