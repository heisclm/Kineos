import { db } from "../src/lib/db";
import { sql } from "drizzle-orm";

async function main() {
  try {
    const res = await db.execute(sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'movies' AND column_name = 'short_teaser';`);
    console.log("Movies:", res);
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
}
main();
