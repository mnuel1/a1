CREATE TYPE "public"."delivery_status" AS ENUM('OUT FOR DELIVERY', 'DELIVERED', 'BACKLOAD', 'PRIORITY', 'NEGATIVE / FOR DOUBLE CHECKING', 'HOLD', 'DISPATCH-PROVINCE');--> statement-breakpoint
CREATE TABLE "deliveries" (
	"delivery_id" integer PRIMARY KEY NOT NULL,
	"shipment_id" integer,
	"tracking_number" text NOT NULL,
	"qty" integer NOT NULL,
	"barcode_no" text NOT NULL,
	"agent" text,
	"shipper_name" text NOT NULL,
	"shipper_ctc" text NOT NULL,
	"consignee" text NOT NULL,
	"consignee_address" text NOT NULL,
	"consignee_ctc" text,
	"received_by" text,
	"destination" text NOT NULL,
	"date_out_for_delivery" date,
	"status" "delivery_status" NOT NULL,
	"date_received" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "deliveries_tracking_number_unique" UNIQUE("tracking_number"),
	CONSTRAINT "deliveries_barcode_no_unique" UNIQUE("barcode_no")
);
--> statement-breakpoint
CREATE TABLE "shipments" (
	"shipment_id" integer PRIMARY KEY NOT NULL,
	"shipment_number" text NOT NULL,
	"container_number" text NOT NULL,
	"total_boxes" integer NOT NULL,
	"unloading_date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "shipments_shipment_number_unique" UNIQUE("shipment_number"),
	CONSTRAINT "shipments_container_number_unique" UNIQUE("container_number")
);
--> statement-breakpoint
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_shipment_id_shipments_shipment_id_fk" FOREIGN KEY ("shipment_id") REFERENCES "public"."shipments"("shipment_id") ON DELETE cascade ON UPDATE no action;