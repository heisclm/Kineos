ALTER TABLE "movies" ADD COLUMN "view_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "movies" ADD COLUMN "download_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "series" ADD COLUMN "view_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "series" ADD COLUMN "download_count" integer DEFAULT 0 NOT NULL;