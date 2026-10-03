import "dotenv/config";
import { db } from './src/lib/db';
import { movies, series, mediaAssets, movieCast, seriesCast, movieGenres, seriesGenres, downloadSources } from './src/lib/db/schema';
import { inArray } from "drizzle-orm";

async function run() {
  try {
    // Delete all hardcoded seed data
    console.log("Deleting seed data...");
    await db.delete(downloadSources);
    await db.delete(mediaAssets);
    await db.delete(movieCast);
    await db.delete(seriesCast);
    await db.delete(movieGenres);
    await db.delete(seriesGenres);
    await db.delete(movies);
    await db.delete(series);
    console.log("Deleted successfully.");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

run();
