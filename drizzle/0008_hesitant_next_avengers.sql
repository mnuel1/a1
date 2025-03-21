ALTER TABLE "deliveries" DROP CONSTRAINT "deliveries_barcode_no_unique";--> statement-breakpoint
ALTER TABLE "deliveries" ALTER COLUMN "barcode_no" DROP NOT NULL;