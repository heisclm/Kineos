ALTER TABLE "download_sources" ADD COLUMN "source_type" varchar(50) DEFAULT 'DIRECT_URL' NOT NULL;--> statement-breakpoint
ALTER TABLE "download_sources" ADD COLUMN "label" varchar(100);--> statement-breakpoint
ALTER TABLE "download_sources" ADD COLUMN "storage_key" text;--> statement-breakpoint
ALTER TABLE "download_sources" ADD COLUMN "sort_order" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "download_sources" ADD COLUMN "upload_status" varchar(50) DEFAULT 'READY';