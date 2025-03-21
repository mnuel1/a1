import type { Actions, RequestEvent, ActionFailure } from './$types';
import { db } from '$lib/server/db';
import { shipments, deliveries } from '$lib/server/db/schema';
import { eq, or, ilike } from 'drizzle-orm';

export const actions: Actions = {
	// Search by name, barcode, tracking_number, or get history by consignee/shipper name
	search: async ({ request }: RequestEvent) => {
		const formData = await request.formData();
		const query = String(formData.get('query')).trim();

		if (!query) {
			return { error: 'Search query cannot be empty' };
		}

		// Search for matching deliveries based on multiple fields
		const results = await db
			.select({
				delivery: deliveries,
				shipmentNumber: shipments.shipmentNumber,
				containerNumber: shipments.containerNumber
			})
			.from(deliveries)
			.leftJoin(shipments, eq(deliveries.shipmentId, shipments.shipmentId))
			.where(
				or(
					ilike(deliveries.shipperName, `%${query}%`),
					ilike(deliveries.trackingNumber, `%${query}%`),
					ilike(deliveries.barcodeNo, `%${query}%`),
					ilike(deliveries.consignee, `%${query}%`),
					ilike(deliveries.consigneeAddress, `%${query}%`),
					ilike(deliveries.agent, `%${query}%`),
					ilike(shipments.shipmentNumber, `%${query}%`),
					ilike(shipments.containerNumber, `%${query}%`)
				)
			);		
		return { 
			searchResult: {results},
			searchFound: results.length === 0 ? false : true 
		 };
	},

	// Create a new delivery and create shipment if not existing
	create: async ({ request }: RequestEvent) => {
		const formData = await request.formData();
		const shipmentNumber = String(formData.get('shipment_number'));
		const containerNumber = String(formData.get('container_number'));
		const totalBoxes = Number(formData.get('total_boxes'));
		const deliveryData = {
			trackingNumber: String(formData.get('tracking_number')),
			qty: Number(formData.get('qty')),
			barcodeNo: String(formData.get('barcode_no')),
			agent: String(formData.get('agent')),
			shipperName: String(formData.get('shipper_name')),
			shipperCtc: String(formData.get('shipper_ctc')),
			consignee: String(formData.get('consignee')),
			consigneeAddress: String(formData.get('consignee_address')),
			consigneeCtc: String(formData.get('consignee_ctc')),
			destination: String(formData.get('destination')),
			status: String(formData.get('status')),
			dateOutForDelivery: formData.get('date_out_for_delivery') as string | null,
			dateReceived: formData.get('date_received') as string | null
		};

		// Check if shipment exists
		let shipment = await db
			.select()
			.from(shipments)
			.where(
				or(
					eq(shipments.shipmentNumber, shipmentNumber),
					eq(shipments.containerNumber, containerNumber)
				)
			)
			.limit(1);

		if (shipment.length === 0) {
			// Create new shipment if not existing
			const [newShipment] = await db
				.insert(shipments)
				.values({
					shipmentNumber,
					containerNumber,
					totalBoxes
				})
				.returning();

			shipment = [newShipment];
		}

		// Create delivery and link to shipment
		await db.insert(deliveries).values({
			...deliveryData,
			shipmentId: shipment[0].shipmentId
		});

		return { success: 'Delivery created successfully' };
	},

	// Update an existing delivery
	update: async ({ request }: RequestEvent) => {
		const formData = await request.formData();
		const deliveryId = Number(formData.get('delivery_id'));

		const deliveryData = {
			trackingNumber: String(formData.get('tracking_number')),
			qty: Number(formData.get('qty')),
			barcodeNo: String(formData.get('barcode_no')),
			agent: String(formData.get('agent')),
			shipperName: String(formData.get('shipper_name')),
			shipperCtc: String(formData.get('shipper_ctc')),
			consignee: String(formData.get('consignee')),
			consigneeAddress: String(formData.get('consignee_address')),
			consigneeCtc: String(formData.get('consignee_ctc')),
			destination: String(formData.get('destination')),
			status: String(formData.get('status')),
			dateOutForDelivery: formData.get('date_out_for_delivery') as string | null,
			dateReceived: formData.get('date_received') as string | null
		};

		// Update the delivery
		const updatedRows = await db
			.update(deliveries)
			.set(deliveryData)
			.where(eq(deliveries.deliveryId, deliveryId));

		if (updatedRows.length === 0) {
			return { error: 'Delivery not found' };
		}

		return { success: 'Delivery updated successfully' };
	},

	// Change status of a delivery
	changeStatus: async ({ request }: RequestEvent) => {
		const formData = await request.formData();
		const deliveryId = Number(formData.get('delivery_id'));
		const status = formData.get('status') || "";

		const updatedRows = await db
			.update(deliveries)
			.set({ status })
			.where(eq(deliveries.deliveryId, deliveryId));

		if (updatedRows.length === 0) {
			return { error: 'Delivery not found' };
		}

		return { success: `Delivery status changed to ${status}` };
	}
};
