import { NextRequest, NextResponse } from "next/server";
import { notifyIndexNow, getSiteBaseUrl } from "@/lib/indexnow";
import { db } from "@/lib/db";
import { movies, series } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { getAllCastMembers } from "@/features/content/content.service";
import { slugify } from "@/lib/utils";
import { verifyAdminAccess } from "@/features/admin/admin.actions";

export const dynamic = "force-dynamic";

/**
 * Endpoint to ping IndexNow with latest movies, series, cast, and catalog URLs.
 * Can be triggered from admin settings or an automated cron job.
 */
export async function POST(req: NextRequest) {
  try {
    const isAdmin = await verifyAdminAccess().catch(() => false);
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || process.env.INDEXNOW_KEY;

    // Allow admin or valid bearer/cron token
    const isSecretAuthorized = cronSecret && authHeader === `Bearer ${cronSecret}`;
    if (!isAdmin && !isSecretAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const baseUrl = getSiteBaseUrl();

    let urlsToSubmit: string[] = [];

    if (Array.isArray(body.urls) && body.urls.length > 0) {
      urlsToSubmit = body.urls;
    } else {
      // Gather all published content URLs
      const [pubMovies, pubSeries, pubCast] = await Promise.all([
        db
          .select({ slug: movies.slug })
          .from(movies)
          .where(eq(movies.publicationStatus, "published"))
          .orderBy(desc(movies.updatedAt))
          .limit(200),
        db
          .select({ slug: series.slug })
          .from(series)
          .where(eq(series.publicationStatus, "published"))
          .orderBy(desc(series.updatedAt))
          .limit(200),
        getAllCastMembers(),
      ]);

      urlsToSubmit = [
        baseUrl,
        `${baseUrl}/movies`,
        `${baseUrl}/series`,
        `${baseUrl}/cast`,
        `${baseUrl}/top-10`,
        `${baseUrl}/watchlist`,
        ...pubMovies.map((m) => `${baseUrl}/movies/${m.slug}`),
        ...pubSeries.map((s) => `${baseUrl}/series/${s.slug}`),
        ...pubCast.slice(0, 150).map((c) => `${baseUrl}/cast/${slugify(c.name)}`),
      ];
    }

    const result = await notifyIndexNow(urlsToSubmit);

    return NextResponse.json({
      success: result.success,
      submitted: result.submitted,
      totalUrls: urlsToSubmit.length,
      message: result.message || "IndexNow ping completed successfully.",
    });
  } catch (error: any) {
    console.error("[IndexNow Ping Route] Error:", error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
