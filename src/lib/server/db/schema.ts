import {
	pgTable,
	serial,
	text,
	integer,
	timestamp,
	uuid,
	date,
	pgEnum
} from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
	id: uuid('id').defaultRandom().primaryKey(),
	loginID: text('login_id').notNull().unique(),
	password: text('password').notNull(),
	name: text("name").notNull(),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
		.notNull()
		.defaultNow(),
});

export const session = pgTable('session', {
	id: text("id").primaryKey(),
	userID: uuid('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

// Delivery status enum
export const deliveryStatusEnum = pgEnum("delivery_status", [
	"OUT FOR DELIVERY",
	"DELIVERED",
	"BACKLOAD",
	"PRIORITY",
	"NEGATIVE / FOR DOUBLE CHECKING",
	"HOLD",
	"DISPATCH-PROVINCE",
	""
]);

// Shipments table
export const shipments = pgTable("shipments", {
	shipmentId: serial("shipment_id").primaryKey(),
	shipmentNumber: text("shipment_number").notNull().unique(),
	containerNumber: text("container_number").notNull().unique(),
	totalBoxes: integer("total_boxes").notNull(),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
		.notNull()
		.defaultNow(),
});

// Deliveries table
export const deliveries = pgTable("deliveries", {
	deliveryId: serial("delivery_id").primaryKey(),
	shipmentId: integer("shipment_id").references(() => shipments.shipmentId, { onDelete: "cascade" }),
	trackingNumber: text("tracking_number").notNull().unique(),
	qty: integer("qty").notNull(),
	barcodeNo: text("barcode_no").notNull().unique(),
	agent: text("agent"),
	shipperName: text("shipper_name").notNull(),
	shipperCtc: text("shipper_ctc").notNull(),
	consignee: text("consignee").notNull(),
	consigneeAddress: text("consignee_address").notNull(),
	consigneeCtc: text("consignee_ctc"),
	receivedBy: text("received_by").default('Not yet set.'),
	destination: text("destination").notNull(),
	dateOutForDelivery: date("date_out_for_delivery"),
	status: deliveryStatusEnum("status"),
	dateReceived: date("date_received"),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
		.notNull()
		.defaultNow(),
});


export type Deliveries = typeof deliveries.$inferSelect

export type Shipments = typeof shipments.$inferSelect

export type Session = typeof session.$inferSelect;

export type User = typeof user.$inferSelect;
