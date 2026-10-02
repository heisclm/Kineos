import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../schema";
import * as dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";

dotenv.config({ path: ".env" });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("No DATABASE_URL found in environment variables.");
  process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function seed() {
  console.log("🌱 Seeding database...");

  // 1. Seed Genres
  console.log("Adding genres...");
  const genresToInsert = [
    { id: uuidv4(), name: "Action", slug: "action" },
    { id: uuidv4(), name: "Animation", slug: "animation" },
    { id: uuidv4(), name: "Adventure", slug: "adventure" },
    { id: uuidv4(), name: "Sci-Fi", slug: "sci-fi" },
    { id: uuidv4(), name: "Comedy", slug: "comedy" },
    { id: uuidv4(), name: "Drama", slug: "drama" },
    { id: uuidv4(), name: "Horror", slug: "horror" },
  ];

  await db.insert(schema.genres).values(genresToInsert).onConflictDoNothing();

  // 2. Seed Movies (from the Kineos screenshot)
  console.log("Adding movies...");
  const moviesToInsert = [
    {
      id: uuidv4(),
      title: "Spider-Man: Across the Spider-Verse",
      slug: "spider-man-across-the-spider-verse",
      description:
        "Miles Morales returns for the next chapter of the Oscar-winning Spider-Verse saga, an epic adventure that will transport Brooklyn's full-time, friendly neighborhood Spider-Man across the Multiverse...",
      status: "released" as const,
      publicationStatus: "published" as const,
      rating: "PG",
      releaseDate: "2023-06-02",
    },
    {
      id: uuidv4(),
      title: "Incredibles 2",
      slug: "incredibles-2",
      description:
        "Helen is called on to lead a campaign to bring Supers back, while Bob navigates the day-to-day heroics of 'normal' life at home with Violet, Dash and baby Jack-Jack...",
      status: "released" as const,
      publicationStatus: "published" as const,
      rating: "PG",
      releaseDate: "2018-06-15",
    },
    {
      id: uuidv4(),
      title: "The Flash",
      slug: "the-flash",
      description:
        "Worlds collide when the Flash uses his superpowers to travel back in time to change the events of the past...",
      status: "released" as const,
      publicationStatus: "published" as const,
      rating: "PG-13",
      releaseDate: "2023-06-16",
    },
    {
      id: uuidv4(),
      title: "Elemental",
      slug: "elemental",
      description:
        "In a city where fire, water, land, and air residents live together, a fiery young woman and a go-with-the-flow guy discover something elemental...",
      status: "released" as const,
      publicationStatus: "published" as const,
      rating: "PG",
      releaseDate: "2023-06-16",
    },
    {
      id: uuidv4(),
      title: "Interstellar",
      slug: "interstellar",
      description:
        "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival...",
      status: "released" as const,
      publicationStatus: "published" as const,
      rating: "PG-13",
      releaseDate: "2014-11-07",
    },
    {
      id: uuidv4(),
      title: "Despicable Me 4",
      slug: "despicable-me-4",
      description:
        "Gru and his family welcome a new member, Gru Jr., who is intent on tormenting his dad...",
      status: "released" as const,
      publicationStatus: "published" as const,
      rating: "PG",
      releaseDate: "2024-07-03",
    },
  ];

  await db.insert(schema.movies).values(moviesToInsert).onConflictDoNothing();

  // 3. Link Genres to Movies
  console.log("Linking genres...");
  const animId = genresToInsert.find((g) => g.name === "Animation")?.id!;
  const advId = genresToInsert.find((g) => g.name === "Adventure")?.id!;
  const sciFiId = genresToInsert.find((g) => g.name === "Sci-Fi")?.id!;

  const movieGenresData = [
    { movieId: moviesToInsert[0].id, genreId: animId },
    { movieId: moviesToInsert[0].id, genreId: advId },
    { movieId: moviesToInsert[1].id, genreId: animId },
    { movieId: moviesToInsert[2].id, genreId: sciFiId },
    { movieId: moviesToInsert[3].id, genreId: animId },
    { movieId: moviesToInsert[4].id, genreId: sciFiId },
    { movieId: moviesToInsert[5].id, genreId: animId },
  ];

  await db.insert(schema.movieGenres).values(movieGenresData).onConflictDoNothing();

  // 4. Add Mock Download Source
  console.log("Adding mock download sources...");
  const spiderVerseDownload = {
    id: uuidv4(),
    contentType: "movie" as const,
    contentId: moviesToInsert[0].id,
    provider: "Kineos CDN",
    url: "https://example.com/downloads/spiderverse.mp4",
    quality: "1080p",
    format: "mp4",
    fileSize: 2147483648, // 2GB
    isActive: true,
  };

  await db.insert(schema.downloadSources).values([spiderVerseDownload]).onConflictDoNothing();

  console.log("✅ Seed completed successfully!");
  process.exit(0);
}

seed().catch((e) => {
  console.error("❌ Seed failed:");
  console.error(e);
  process.exit(1);
});
