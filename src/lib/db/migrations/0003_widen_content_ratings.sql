ALTER TABLE "download_sources" ALTER COLUMN "file_size" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "movies" ALTER COLUMN "rating" SET DATA TYPE varchar(32);--> statement-breakpoint
ALTER TABLE "movies" ADD COLUMN "short_teaser" varchar(500);--> statement-breakpoint
ALTER TABLE "movies" ADD COLUMN "rating_score" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "series" ADD COLUMN "short_teaser" varchar(500);--> statement-breakpoint
ALTER TABLE "series" ADD COLUMN "language" varchar(50);--> statement-breakpoint
ALTER TABLE "series" ADD COLUMN "rating" varchar(32);