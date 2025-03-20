
import type { RequestEvent } from "@sveltejs/kit";
import { json } from "@sveltejs/kit";

import { db } from "$lib/server/db";
import { shipments, deliveries } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

export async function POST({ request }: RequestEvent) {
    try {
        const { manifestData } = await request.json();
        
        if (!Array.isArray(manifestData.manifestData) || manifestData.manifestData.length === 0) {
            return json({ error: "No valid data provided." }, { status: 400 });
        }   

        // Check if shipment already exists to prevent duplicates
        const existingShipment = await db
            .select()   
            .from(shipments)
            .where(eq(shipments.shipmentNumber, 
                manifestData.shipmentNo))
            .limit(1);

        let shipmentId;
        
        if (existingShipment.length === 0) {
            // Insert into shipments if not already present
            const [newShipment] = await db
                .insert(shipments)
                .values({
                    shipmentNumber: manifestData.shipmentNo,
                    containerNumber: manifestData.containerNo,
                    totalBoxes: parseInt(manifestData.totalBoxes),
                })
                .returning({ shipmentId: shipments.shipmentId });

            shipmentId = newShipment.shipmentId;
        } else {
            shipmentId = existingShipment[0].shipmentId;
        }

         //         shipmentId: shipmentId,
        //         trackingNumber: row["TRACKING NO."],
        //         qty: parseInt(row["NO. OF BOXES"]),
        //         barcodeNo: row["BARCODE"],
        //         agent: row["AGENT"],
        //         shipperName: row["NAME OF SENDER"],
        //         shipperCtc: row["CONTACT NO."],
        //         consignee: row["CONSIGNEE"],
        //         consigneeAddress: row["CONSIGNEE_ADDRESS"],
        //         consigneeCtc: row["CONTACT NO._1"],
        //         destination: row["DESTINATION"],
        //         status: null, // Default status
        
        // const deliveryRows = manifestData.map((row) => ({
        //     shipmentId: shipmentId,
        //     trackingNumber: row["TRACKING NO."],
        //     qty: parseInt(row["NO. OF BOXES"]),
        //     barcodeNo: row["BARCODE"],
        //     agent: row["AGENT"],
        //     shipperName: row["NAME OF SENDER"],
        //     shipperCtc: row["CONTACT NO."],
        //     consignee: row["CONSIGNEE"],
        //     consigneeAddress: row["CONSIGNEE_ADDRESS"],
        //     consigneeCtc: row["CONTACT NO._1"],
        //     destination: row["DESTINATION"],
        //     status: null, // Default status
        // }));
    
        // // 🚀 Bulk insert and ignore duplicates
        // await db
        //     .insert(deliveries)
        //     .values(deliveryRows)
        //     .onConflictDoNothing(); // Skip if trackingNumber or barcodeNo exists
    
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
        //         consigneeCtc: row["CONTACT NO._1"],
        //         destination: row["DESTINATION"],
        //         status: null, // Default status
        //     });

        //     break
        

        return json({ success: true, message: "Data inserted successfully!" });
    } catch (err) {
        console.error("Error inserting data:", err);
        return json({ error: "Error processing data or inserting records." }, { status: 500 });
    }
}
