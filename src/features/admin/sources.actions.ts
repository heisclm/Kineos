"use server";

import { db } from "@/lib/db";
import { downloadSources, series, movies } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { verifyAdminAccess } from "./admin.actions";

export async function addDownloadSource(formData: FormData) {
  try {
    const isAdmin = await verifyAdminAccess();
    if (!isAdmin) {
      return { success: false, error: "Unauthorized: Admin privileges required." };
    }

    const contentId = formData.get("contentId") as string;
    const contentType = formData.get("contentType") as "movie" | "series" | "episode";
    const seriesId = formData.get("seriesId") as string | null;
    const sourceType = formData.get("sourceType") as string;
    const url = formData.get("url") as string;
    const label = formData.get("label") as string;
    const quality = formData.get("quality") as string;
    const format = formData.get("format") as string;
    const language = formData.get("language") as string;
    const fileSizeRaw = formData.get("fileSize") as string | null;
    const storageKey = formData.get("storageKey") as string;

    if (!contentId || !contentType || !url) {
      return { success: false, error: "Missing required fields (contentId, contentType, or URL)." };
    }

    const fileSize = fileSizeRaw && !isNaN(Number(fileSizeRaw)) ? Number(fileSizeRaw) : undefined;

    await db.insert(downloadSources).values({
      contentId,
      contentType,
      sourceType: sourceType || "DIRECT_URL",
      url,
      label: label ? label.trim() : undefined,
      quality: quality ? quality.trim() : undefined,
      format: format ? format.trim() : undefined,
      language: language ? language.trim() : undefined,
      fileSize: fileSize ?? undefined,
      storageKey: storageKey || undefined,
      uploadStatus: sourceType === "CLOUDFLARE_R2" ? "READY" : "READY",
      isActive: true,
    });

    // Smart Revalidation of Admin & Public Detail Pages
    if (contentType === "series" || seriesId) {
      const targetSeriesId = seriesId || contentId;
      revalidatePath(`/admin/series/${targetSeriesId}`);
      try {
        const s = await db.select({ slug: series.slug }).from(series).where(eq(series.id, targetSeriesId)).limit(1);
        if (s[0]?.slug) {
          revalidatePath(`/series/${s[0].slug}`);
        }
      } catch (err) {
        console.warn("Could not revalidate series slug:", err);
      }
    } else if (contentType === "movie") {
      revalidatePath(`/admin/movies/${contentId}`);
      try {
        const m = await db.select({ slug: movies.slug }).from(movies).where(eq(movies.id, contentId)).limit(1);
        if (m[0]?.slug) {
          revalidatePath(`/movies/${m[0].slug}`);
        }
      } catch (err) {
        console.warn("Could not revalidate movie slug:", err);
      }
    }

    revalidatePath("/series");
    revalidatePath("/movies");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    console.error("Failed to add download source:", error);
    return { success: false, error: error.message || "Failed to save download source." };
  }
}

export async function deleteDownloadSource(
  id: string,
  contentId: string,
  contentType: "movie" | "series" | "episode",
  seriesId?: string
) {
  try {
    const isAdmin = await verifyAdminAccess();
    if (!isAdmin) {
      return { success: false, error: "Unauthorized: Admin privileges required." };
    }

    await db.delete(downloadSources).where(eq(downloadSources.id, id));

    if (contentType === "series" || seriesId) {
      const targetSeriesId = seriesId || contentId;
      revalidatePath(`/admin/series/${targetSeriesId}`);
      try {
        const s = await db.select({ slug: series.slug }).from(series).where(eq(series.id, targetSeriesId)).limit(1);
        if (s[0]?.slug) {
          revalidatePath(`/series/${s[0].slug}`);
        }
      } catch (err) {
        console.warn("Could not revalidate series slug:", err);
      }
    } else if (contentType === "movie") {
      revalidatePath(`/admin/movies/${contentId}`);
      try {
        const m = await db.select({ slug: movies.slug }).from(movies).where(eq(movies.id, contentId)).limit(1);
        if (m[0]?.slug) {
          revalidatePath(`/movies/${m[0].slug}`);
        }
      } catch (err) {
        console.warn("Could not revalidate movie slug:", err);
      }
    }

    revalidatePath("/series");
    revalidatePath("/movies");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete download source:", error);
    return { success: false, error: error.message };
  }
}

export async function toggleDownloadSource(
  id: string,
  isActive: boolean,
  contentId: string,
  contentType: "movie" | "series" | "episode",
  seriesId?: string
) {
  try {
    const isAdmin = await verifyAdminAccess();
    if (!isAdmin) {
      return { success: false, error: "Unauthorized: Admin privileges required." };
    }

    await db.update(downloadSources).set({ isActive }).where(eq(downloadSources.id, id));

    if (contentType === "series" || seriesId) {
      const targetSeriesId = seriesId || contentId;
      revalidatePath(`/admin/series/${targetSeriesId}`);
      try {
        const s = await db.select({ slug: series.slug }).from(series).where(eq(series.id, targetSeriesId)).limit(1);
        if (s[0]?.slug) {
          revalidatePath(`/series/${s[0].slug}`);
        }
      } catch (err) {
        console.warn("Could not revalidate series slug:", err);
      }
    } else if (contentType === "movie") {
      revalidatePath(`/admin/movies/${contentId}`);
      try {
        const m = await db.select({ slug: movies.slug }).from(movies).where(eq(movies.id, contentId)).limit(1);
        if (m[0]?.slug) {
          revalidatePath(`/movies/${m[0].slug}`);
        }
      } catch (err) {
        console.warn("Could not revalidate movie slug:", err);
      }
    }

    revalidatePath("/series");
    revalidatePath("/movies");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    console.error("Failed to toggle download source:", error);
    return { success: false, error: error.message };
  }
}

export async function getDownloadSources(contentId: string) {
  try {
    return await db.select().from(downloadSources).where(eq(downloadSources.contentId, contentId));
  } catch (error: any) {
    console.error("Failed to fetch sources:", error);
    return [];
  }
}

export async function generateR2UploadUrl(filename: string, contentType: string) {
  try {
    const isAdmin = await verifyAdminAccess();
    if (!isAdmin) return { success: false, error: "Unauthorized" };
    return {
      success: true,
      uploadUrl: "https://mock-r2-endpoint.cloudflare.com/upload",
      storageKey: `media/${Date.now()}-${filename}`,
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
