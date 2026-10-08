import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  pgEnum,
  date,
  primaryKey,
  uniqueIndex,
  bigint,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// -----------------------------------------------------------------------------
// ENUMS
// -----------------------------------------------------------------------------
export const contentTypeEnum = pgEnum("content_type", ["movie", "series", "episode"]);
export const publicationStatusEnum = pgEnum("publication_status", ["draft", "published", "archived"]);
export const mediaTypeEnum = pgEnum("media_type", ["poster", "backdrop", "trailer", "thumbnail", "logo"]);
export const contentStatusEnum = pgEnum("content_status", ["released", "upcoming", "rumored", "canceled"]);

// -----------------------------------------------------------------------------
// IDENTITY & ACCESS (Users & Roles)
// -----------------------------------------------------------------------------

// We assume Supabase handles the actual 'users' table in the auth schema.
// This profiles table maps 1:1 with auth.users via the id.
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(), // Matches auth.users.id
  displayName: varchar("display_name", { length: 100 }),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const roles = pgTable("roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(), // admin, editor, user
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userRoles = pgTable(
  "user_roles",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.roleId] }),
  })
);

// -----------------------------------------------------------------------------
// CONTENT CORE
// -----------------------------------------------------------------------------

export const movies = pgTable(
  "movies",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    originalTitle: varchar("original_title", { length: 255 }),
    description: text("description"),
    shortTeaser: varchar("short_teaser", { length: 500 }),
    releaseDate: date("release_date"),
    runtime: integer("runtime"), // in minutes
    status: contentStatusEnum("status").default("released").notNull(),
    publicationStatus: publicationStatusEnum("publication_status").default("draft").notNull(),
    language: varchar("language", { length: 50 }),
    country: varchar("country", { length: 100 }),
    seoTitle: varchar("seo_title", { length: 255 }),
    seoDescription: text("seo_description"),
    rating: varchar("rating", { length: 32 }), // e.g., PG-13, TV-MA / 16+
    ratingScore: integer("rating_score").default(0), // Out of 100
    trailerUrl: text("trailer_url"),
    viewCount: integer("view_count").default(0).notNull(),
    downloadCount: integer("download_count").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: uniqueIndex("movie_slug_idx").on(table.slug),
  })
);

export const series = pgTable(
  "series",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: text("description"),
    shortTeaser: varchar("short_teaser", { length: 500 }),
    releaseDate: date("release_date"),
    status: contentStatusEnum("status").default("released").notNull(),
    publicationStatus: publicationStatusEnum("publication_status").default("draft").notNull(),
    language: varchar("language", { length: 50 }),
    country: varchar("country", { length: 100 }),
    rating: varchar("rating", { length: 32 }),
    ratingScore: integer("rating_score").default(0),
    trailerUrl: text("trailer_url"),
    viewCount: integer("view_count").default(0).notNull(),
    downloadCount: integer("download_count").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: uniqueIndex("series_slug_idx").on(table.slug),
  })
);

export const seasons = pgTable("seasons", {
  id: uuid("id").defaultRandom().primaryKey(),
  seriesId: uuid("series_id")
    .notNull()
    .references(() => series.id, { onDelete: "cascade" }),
  seasonNumber: integer("season_number").notNull(),
  title: varchar("title", { length: 255 }),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const episodes = pgTable("episodes", {
  id: uuid("id").defaultRandom().primaryKey(),
  seasonId: uuid("season_id")
    .notNull()
    .references(() => seasons.id, { onDelete: "cascade" }),
  episodeNumber: integer("episode_number").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  runtime: integer("runtime"),
  releaseDate: date("release_date"),
  publicationStatus: publicationStatusEnum("publication_status").default("draft").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// -----------------------------------------------------------------------------
// TAXONOMY & METADATA
// -----------------------------------------------------------------------------

export const genres = pgTable("genres", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
});

export const movieGenres = pgTable(
  "movie_genres",
  {
    movieId: uuid("movie_id")
      .notNull()
      .references(() => movies.id, { onDelete: "cascade" }),
    genreId: uuid("genre_id")
      .notNull()
      .references(() => genres.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.movieId, t.genreId] }),
  })
);

export const seriesGenres = pgTable(
  "series_genres",
  {
    seriesId: uuid("series_id")
      .notNull()
      .references(() => series.id, { onDelete: "cascade" }),
    genreId: uuid("genre_id")
      .notNull()
      .references(() => genres.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.seriesId, t.genreId] }),
  })
);

export const people = pgTable("people", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  bio: text("bio"),
  imageUrl: text("image_url"),
});

export const movieCast = pgTable(
  "movie_cast",
  {
    movieId: uuid("movie_id")
      .notNull()
      .references(() => movies.id, { onDelete: "cascade" }),
    personId: uuid("person_id")
      .notNull()
      .references(() => people.id, { onDelete: "cascade" }),
    roleName: varchar("role_name", { length: 255 }), // e.g., "Actor", "Director", or Character name
    order: integer("order").default(0),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.movieId, t.personId] }),
  })
);

export const seriesCast = pgTable(
  "series_cast",
  {
    seriesId: uuid("series_id")
      .notNull()
      .references(() => series.id, { onDelete: "cascade" }),
    personId: uuid("person_id")
      .notNull()
      .references(() => people.id, { onDelete: "cascade" }),
    roleName: varchar("role_name", { length: 255 }),
    order: integer("order").default(0),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.seriesId, t.personId] }),
  })
);

// -----------------------------------------------------------------------------
// MEDIA & DELIVERY
// -----------------------------------------------------------------------------

export const mediaAssets = pgTable("media_assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  contentType: contentTypeEnum("content_type").notNull(),
  contentId: uuid("content_id").notNull(), // Polymorphic ID (could be movie, series, episode)
  type: mediaTypeEnum("type").notNull(),
  provider: varchar("provider", { length: 100 }), // e.g., "S3", "TMDB"
  url: text("url").notNull(),
  width: integer("width"),
  height: integer("height"),
  isPrimary: boolean("is_primary").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const downloadSources = pgTable("download_sources", {
  id: uuid("id").defaultRandom().primaryKey(),
  contentType: contentTypeEnum("content_type").notNull(),
  contentId: uuid("content_id").notNull(),
  sourceType: varchar("source_type", { length: 50 }).notNull().default('DIRECT_URL'), // CLOUDFLARE_R2, DIRECT_URL, TORRENT_MAGNET
  provider: varchar("provider", { length: 100 }), 
  label: varchar("label", { length: 100 }), 
  url: text("url").notNull(),
  storageKey: text("storage_key"),
  quality: varchar("quality", { length: 50 }),
  fileSize: bigint("file_size", { mode: "number" }),
  format: varchar("format", { length: 50 }),
  language: varchar("language", { length: 50 }),
  sortOrder: integer("sort_order").default(0),
  uploadStatus: varchar("upload_status", { length: 50 }).default('READY'), // PENDING, UPLOADING, PROCESSING, READY, FAILED
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const streamingSources = pgTable("streaming_sources", {
  id: uuid("id").defaultRandom().primaryKey(),
  contentType: contentTypeEnum("content_type").notNull(),
  contentId: uuid("content_id").notNull(),
  provider: varchar("provider", { length: 100 }), 
  url: text("url").notNull(),
  format: varchar("format", { length: 50 }), // e.g., "HLS", "DASH"
  isActive: boolean("is_active").default(false), // Default to false since Streaming is "Coming Soon"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// -----------------------------------------------------------------------------
// USER ACTIVITY & ADMIN
// -----------------------------------------------------------------------------

export const watchlists = pgTable("watchlists", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  contentType: contentTypeEnum("content_type").notNull(),
  contentId: uuid("content_id").notNull(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

export const downloadHistory = pgTable("download_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  downloadSourceId: uuid("download_source_id")
    .notNull()
    .references(() => downloadSources.id, { onDelete: "cascade" }),
  downloadedAt: timestamp("downloaded_at").defaultNow().notNull(),
});

export const featuredContent = pgTable("featured_content", {
  id: uuid("id").defaultRandom().primaryKey(),
  contentType: contentTypeEnum("content_type").notNull(),
  contentId: uuid("content_id").notNull(),
  placement: varchar("placement", { length: 50 }).notNull(), // e.g., "hero", "trending"
  activeFrom: timestamp("active_from"),
  activeTo: timestamp("active_to"),
  order: integer("order").default(0),
});


