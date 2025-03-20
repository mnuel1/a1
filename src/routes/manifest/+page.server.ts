import type { RequestEvent, ActionFailure } from "@sveltejs/kit";
import type { Actions } from "./$types";

import { db } from "$lib/server/db";
import { shipments, deliveries } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

export const actions: Actions = {
    default: async ({ request }: RequestEvent): Promise<{ success?: boolean; error?: string } | ActionFailure<any>> => {
        try {
            const jsonData = await request.json(); // Expect JSON data directly

            if (!Array.isArray(jsonData) || jsonData.length === 0) {
                return { error: "No valid data provided." };
            }

            console.log(jsonData)

            // Process each row in the Excel data array
            // for (const row of jsonData) {
            //     // Check if shipment already exists to prevent duplicates
            //     const existingShipment = await db
            //         .select()
            //         .from(shipments)
            //         .where(eq(shipments.shipmentNumber, row["SHIPMENT NO."]))
            //         .limit(1);

            //     let shipmentId;

            //     if (existingShipment.length === 0) {
            //         // Insert into shipments if not already present
            //         const [newShipment] = await db
            //             .insert(shipments)
            //             .values({
            //                 shipmentNumber: row["SHIPMENT NO."],
            //                 containerNumber: row["CONTAINER NO."],
            //                 totalBoxes: parseInt(row["NO. OF BOXES"]),
            //             })
            //             .returning({ shipmentId: shipments.shipmentId });

            //         shipmentId = newShipment.shipmentId;
            //     } else {
            //         shipmentId = existingShipment[0].shipmentId;
            //     }

            //     // Insert into deliveries using the shipmentId
            //     await db.insert(deliveries).values({
            //         shipmentId: shipmentId,
            //         trackingNumber: row["TRACKING NO."],
            //         qty: parseInt(row["NO. OF BOXES"]),
            //         barcodeNo: row["BARCODE"],
            //         agent: row["AGENT"],
            //         shipperName: row["NAME OF SENDER"],
            //         shipperCtc: row["CONTACT NO."],
            //         consignee: row["CONSIGNEE"],
            //         consigneeAddress: row["CONSIGNEE_ADDRESS"],
            //         consigneeCtc: row["CONTACT NO."],
            //         destination: row["DESTINATION"],
            //         status: "Pending", // Default status
            //     });
            // }

            return { success: true, message: "Data inserted successfully!" } as { success?: boolean; message?: string };
        } catch (err) {
            console.error("Error inserting data:", err);
            return { error: "Error processing data or inserting records." };
        }
    },
};
