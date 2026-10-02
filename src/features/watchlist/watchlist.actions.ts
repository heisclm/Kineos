"use server";

import { db } from "@/lib/db";
import { watchlists, profiles } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

async function ensureProfile(userId: string) {
  const profile = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1);
  if (!profile.length) {
    try {
      await db.insert(profiles).values({ id: userId });
    } catch (e) {
      // Ignore conflict if it was just created
    }
  }
}

export async function toggleWatchlist(contentId: string, contentType: "movie" | "series") {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in to modify your watchlist.");
  }

  await ensureProfile(user.id);

  const existing = await db
    .select()
    .from(watchlists)
    .where(
      and(
        eq(watchlists.userId, user.id),
        eq(watchlists.contentId, contentId),
        eq(watchlists.contentType, contentType)
      )
    )
    .limit(1);

  let isWatchlisted = false;

  if (existing.length > 0) {
    // Remove from watchlist
    await db
      .delete(watchlists)
      .where(eq(watchlists.id, existing[0].id));
    isWatchlisted = false;
  } else {
    // Add to watchlist
    await db.insert(watchlists).values({
      userId: user.id,
      contentId,
      contentType,
    });
    isWatchlisted = true;
  }

  revalidatePath(`/movies/[slug]`, 'page');
  revalidatePath('/watchlist', 'page');

  return { isWatchlisted };
}

export async function getIsWatchlisted(contentId: string, contentType: "movie" | "series") {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return false;

  try {
    const existing = await db
      .select()
      .from(watchlists)
      .where(
        and(
          eq(watchlists.userId, user.id),
          eq(watchlists.contentId, contentId),
          eq(watchlists.contentType, contentType)
        )
      )
      .limit(1);

    return existing.length > 0;
  } catch (e) {
    return false;
  }
}
