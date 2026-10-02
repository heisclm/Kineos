"use server";

import { db } from "@/lib/db";
import { userRoles, roles, movies, series, mediaAssets } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Validates if the current authenticated user has the 'admin' role.
 */
export async function verifyAdminAccess() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return false;

  try {
    const adminRole = await db
      .select({ id: roles.id })
      .from(roles)
      .where(eq(roles.name, "admin"))
      .limit(1);

    if (!adminRole.length) return false;

    const userRoleMapping = await db
      .select()
      .from(userRoles)
      .where(
        and(
          eq(userRoles.userId, user.id),
          eq(userRoles.roleId, adminRole[0].id)
        )
      )
      .limit(1);

    // If the mapping exists, they are an admin
    return userRoleMapping.length > 0;
  } catch (e) {
    console.error("Failed to verify admin access", e);
    return false;
  }
}

/**
 * Create a new movie in the database.
 */
export async function createMovie(formData: FormData) {
  const isAdmin = await verifyAdminAccess();
  if (!isAdmin) {
    throw new Error("Unauthorized");
  }

  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const status = formData.get("status") as "draft" | "published" | "archived";
  const releaseDate = formData.get("releaseDate") as string;
  const runtime = parseInt(formData.get("runtime") as string) || null;
  const rating = formData.get("rating") as string;
  const posterUrl = formData.get("posterUrl") as string;
  const backdropUrl = formData.get("backdropUrl") as string;

  try {
    const newRow = await db.insert(movies).values({
      title,
      slug,
      description,
      publicationStatus: status,
      releaseDate: releaseDate ? new Date(releaseDate).toISOString() : null,
      runtime,
      rating,
    }).returning({ id: movies.id });
    
    if (posterUrl) {
      await db.insert(mediaAssets).values({
        contentType: 'movie',
        contentId: newRow[0].id,
        type: 'poster',
        url: posterUrl,
        isPrimary: true,
      });
    }
    if (backdropUrl) {
      await db.insert(mediaAssets).values({
        contentType: 'movie',
        contentId: newRow[0].id,
        type: 'backdrop',
        url: backdropUrl,
        isPrimary: true,
      });
    }

    revalidatePath("/admin/movies");
    return { success: true, id: newRow[0].id };
  } catch (e: any) {
    console.error("Failed to create movie", e);
    return { success: false, error: e.message };
  }
}

export async function createSeries(formData: FormData) {
  const isAdmin = await verifyAdminAccess();
  if (!isAdmin) {
    throw new Error("Unauthorized");
  }

  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const status = formData.get("status") as "draft" | "published" | "archived";
  const releaseDate = formData.get("releaseDate") as string;
  const runtime = parseInt(formData.get("runtime") as string) || null;
  const rating = formData.get("rating") as string;
  const posterUrl = formData.get("posterUrl") as string;
  const backdropUrl = formData.get("backdropUrl") as string;

  try {
    const newRow = await db.insert(series).values({
      title,
      slug,
      description,
      publicationStatus: status,
      releaseDate: releaseDate ? new Date(releaseDate).toISOString() : null,
    }).returning({ id: series.id });
    
    if (posterUrl) {
      await db.insert(mediaAssets).values({
        contentType: 'series',
        contentId: newRow[0].id,
        type: 'poster',
        url: posterUrl,
        isPrimary: true,
      });
    }
    if (backdropUrl) {
      await db.insert(mediaAssets).values({
        contentType: 'series',
        contentId: newRow[0].id,
        type: 'backdrop',
        url: backdropUrl,
        isPrimary: true,
      });
    }

    revalidatePath("/admin/series");
    return { success: true, id: newRow[0].id };
  } catch (e: any) {
    console.error("Failed to create series", e);
    return { success: false, error: e.message };
  }
}

export async function createSeason(seriesId: string, seasonNumber: number, title?: string) {
  const isAdmin = await verifyAdminAccess();
  if (!isAdmin) throw new Error("Unauthorized");
  
  try {
    const { seasons } = require('@/lib/db/schema');
    await db.insert(seasons).values({
      seriesId,
      seasonNumber,
      title: title || ('Season ' + seasonNumber)
    });
    revalidatePath('/admin/series/' + seriesId);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function createEpisode(seasonId: string, episodeNumber: number, title: string, seriesId: string) {
  const isAdmin = await verifyAdminAccess();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    const { episodes } = require('@/lib/db/schema');
    await db.insert(episodes).values({
      seasonId,
      episodeNumber,
      title,
      publicationStatus: 'published'
    });
    revalidatePath('/admin/series/' + seriesId);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}




