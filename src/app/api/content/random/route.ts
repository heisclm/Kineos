import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { movies, series } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 50% chance to pick movie or series first, or query both
    const shouldPickMovie = Math.random() > 0.35;

    let randomTitle = null;

    if (shouldPickMovie) {
      const randomMovies = await db
        .select({
          id: movies.id,
          title: movies.title,
          slug: movies.slug,
        })
        .from(movies)
        .where(eq(movies.publicationStatus, "published"))
        .orderBy(sql`RANDOM()`)
        .limit(1);

      if (randomMovies.length > 0) {
        randomTitle = {
          ...randomMovies[0],
          type: "movie",
          url: `/movies/${randomMovies[0].slug}`,
        };
      }
    }

    if (!randomTitle) {
      const randomSeries = await db
        .select({
          id: series.id,
          title: series.title,
          slug: series.slug,
        })
        .from(series)
        .where(eq(series.publicationStatus, "published"))
        .orderBy(sql`RANDOM()`)
        .limit(1);

      if (randomSeries.length > 0) {
        randomTitle = {
          ...randomSeries[0],
          type: "series",
          url: `/series/${randomSeries[0].slug}`,
        };
      } else {
        // Fallback to movie if series is empty
        const fallbackMovies = await db
          .select({
            id: movies.id,
            title: movies.title,
            slug: movies.slug,
          })
          .from(movies)
          .where(eq(movies.publicationStatus, "published"))
          .orderBy(sql`RANDOM()`)
          .limit(1);

        if (fallbackMovies.length > 0) {
          randomTitle = {
            ...fallbackMovies[0],
            type: "movie",
            url: `/movies/${fallbackMovies[0].slug}`,
          };
        }
      }
    }

    if (!randomTitle) {
      return NextResponse.json({ success: false, error: "No published titles found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      title: randomTitle.title,
      type: randomTitle.type,
      url: randomTitle.url,
    });
  } catch (error) {
    console.error("Error fetching random content:", error);
    return NextResponse.json({ success: false, error: "Failed to pick random title" }, { status: 500 });
  }
}
