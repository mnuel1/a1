ALTER TABLE "deliveries" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "deliveries" ALTER COLUMN "status" DROP NOT NULL;