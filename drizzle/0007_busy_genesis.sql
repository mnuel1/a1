ALTER TABLE "deliveries" ALTER COLUMN "shipper_name" SET DEFAULT 'No Value';--> statement-breakpoint
ALTER TABLE "deliveries" ALTER COLUMN "shipper_name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "deliveries" ALTER COLUMN "shipper_ctc" SET DEFAULT 'No Value';--> statement-breakpoint
ALTER TABLE "deliveries" ALTER COLUMN "shipper_ctc" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "deliveries" ALTER COLUMN "consignee" SET DEFAULT 'No Value';--> statement-breakpoint
ALTER TABLE "deliveries" ALTER COLUMN "consignee" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "deliveries" ALTER COLUMN "consignee_address" SET DEFAULT 'No Value';--> statement-breakpoint
ALTER TABLE "deliveries" ALTER COLUMN "consignee_address" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "deliveries" ALTER COLUMN "destination" SET DEFAULT 'No Value';--> statement-breakpoint
ALTER TABLE "deliveries" ALTER COLUMN "destination" DROP NOT NULL;