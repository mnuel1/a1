ALTER TYPE "public"."delivery_status" ADD VALUE '';--> statement-breakpoint
ALTER TABLE "deliveries" ALTER COLUMN "received_by" SET DEFAULT 'Not yet set.';--> statement-breakpoint
ALTER TABLE "deliveries" ALTER COLUMN "status" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "shipments" DROP COLUMN "unloading_date";