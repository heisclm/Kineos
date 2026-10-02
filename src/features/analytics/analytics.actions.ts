"use server";

import { db } from "@/lib/db";
import { movies, series } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";

export async function incrementViewCount(id: string, type: "movie" | "series") {
  try {
    if (type === "movie") {
      await db
        .update(movies)
        .set({ viewCount: sql`${movies.viewCount} + 1` })
        .where(eq(movies.id, id));
    } else if (type === "series") {
      await db
        .update(series)
        .set({ viewCount: sql`${series.viewCount} + 1` })
        .where(eq(series.id, id));
    }
  } catch (error) {
    console.error("Failed to increment view count", error);
  }
}
