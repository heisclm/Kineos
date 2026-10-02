import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { db } from "./index";
import { movies, series, roles, profiles, userRoles } from "./schema";

async function main() {
  console.log("Seeding database...");

  try {
    // Seed Movies
    console.log("Seeding movies...");
    await db.insert(movies).values([
      {
        title: "Dune: Part Two",
        slug: "dune-part-two",
        description: "Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.",
        publicationStatus: "published",
        releaseDate: "2024-03-01T00:00:00.000Z",
        runtime: 166,
        rating: "PG-13",
      },
      {
        title: "Oppenheimer",
        slug: "oppenheimer",
        description: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.",
        publicationStatus: "published",
        releaseDate: "2023-07-21T00:00:00.000Z",
        runtime: 180,
        rating: "R",
      },
      {
        title: "Poor Things",
        slug: "poor-things",
        description: "The incredible tale about the fantastical evolution of Bella Baxter, a young woman brought back to life by the brilliant and unorthodox scientist Dr. Godwin Baxter.",
        publicationStatus: "published",
        releaseDate: "2023-12-08T00:00:00.000Z",
        runtime: 141,
        rating: "R",
      }
    ]).onConflictDoNothing();

    // Seed Series
    console.log("Seeding series...");
    await db.insert(series).values([
      {
        title: "Shōgun",
        slug: "shogun",
        description: "When a mysterious European ship is found marooned in a nearby fishing village, Lord Yoshii Toranaga discovers secrets that could tip the scales of power.",
        publicationStatus: "published",
        releaseDate: "2024-02-27T00:00:00.000Z",
      },
      {
        title: "The Last of Us",
        slug: "the-last-of-us",
        description: "After a global pandemic destroys civilization, a hardened survivor takes charge of a 14-year-old girl who may be humanity's last hope.",
        publicationStatus: "published",
        releaseDate: "2023-01-15T00:00:00.000Z",
      },
      {
        title: "Succession",
        slug: "succession",
        description: "The Roy family is known for controlling the biggest media and entertainment company in the world. However, their world changes when their father steps down from the company.",
        publicationStatus: "published",
        releaseDate: "2018-06-03T00:00:00.000Z",
      }
    ]).onConflictDoNothing();

    // Ensure Admin Role Exists
    console.log("Seeding roles...");
    await db.insert(roles).values([
      {
        name: "admin",
      }
    ]).onConflictDoNothing();

    console.log("✅ Seeding complete!");
  } catch (error) {
    console.error("❌ Seeding failed:");
    console.error(error);
  }
}

main().then(() => process.exit(0)).catch(() => process.exit(1));
