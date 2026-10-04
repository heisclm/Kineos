"use server";

import { db } from "@/lib/db";
import { downloadSources } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { verifyAdminAccess } from "./admin.actions";

export async function addDownloadSource(formData: FormData) {
  const isAdmin = await verifyAdminAccess();
  if (!isAdmin) throw new Error("Unauthorized");
  try {
    const contentId = formData.get("contentId") as string;
    const contentType = formData.get("contentType") as "movie" | "series" | "episode";
    const seriesId = formData.get("seriesId") as string | null;
    const sourceType = formData.get("sourceType") as string;
    const url = formData.get("url") as string;
    const label = formData.get("label") as string;
    const quality = formData.get("quality") as string;
    const format = formData.get("format") as string;
    const language = formData.get("language") as string;
    const fileSize = formData.get("fileSize") as string;
    const storageKey = formData.get("storageKey") as string;

    await db.insert(downloadSources).values({
      contentId,
      contentType,
      sourceType,
      url,
      label: label || undefined,
      quality: quality || undefined,
      format: format || undefined,
      language: language || undefined,
      fileSize: fileSize || undefined,
      storageKey: storageKey || undefined,
      uploadStatus: sourceType === "CLOUDFLARE_R2" ? "READY" : "READY",
      isActive: true,
    });

    if (seriesId) {
      revalidatePath(`/admin/series/${seriesId}`);
    }
    revalidatePath(`/admin/${contentType === "movie" ? "movies" : "series"}/${contentId}`);
    revalidatePath('/series');
    revalidatePath('/movies');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error("Failed to add download source:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteDownloadSource(id: string, contentId: string, contentType: "movie" | "series" | "episode", seriesId?: string) {
  const isAdmin = await verifyAdminAccess();
  if (!isAdmin) throw new Error("Unauthorized");
  try {
    await db.delete(downloadSources).where(eq(downloadSources.id, id));
    if (seriesId) {
      revalidatePath(`/admin/series/${seriesId}`);
    }
    revalidatePath(`/admin/${contentType === "movie" ? "movies" : "series"}/${contentId}`);
    revalidatePath('/series');
    revalidatePath('/movies');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleDownloadSource(id: string, isActive: boolean, contentId: string, contentType: "movie" | "series" | "episode", seriesId?: string) {
  const isAdmin = await verifyAdminAccess();
  if (!isAdmin) throw new Error("Unauthorized");
  try {
    await db.update(downloadSources).set({ isActive }).where(eq(downloadSources.id, id));
    if (seriesId) {
      revalidatePath(`/admin/series/${seriesId}`);
    }
    revalidatePath(`/admin/${contentType === "movie" ? "movies" : "series"}/${contentId}`);
    revalidatePath('/series');
    revalidatePath('/movies');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getDownloadSources(contentId: string) {
  try {
    return await db.select().from(downloadSources).where(eq(downloadSources.contentId, contentId));
  } catch (error) {
    console.error("Failed to fetch sources:", error);
    return [];
  }
}

export async function generateR2UploadUrl(filename: string, contentType: string) {
  const isAdmin = await verifyAdminAccess();
  if (!isAdmin) throw new Error("Unauthorized");
  return {
    success: true,
    uploadUrl: "https://mock-r2-endpoint.cloudflare.com/upload",
    storageKey: `media/${Date.now()}-${filename}`
  };
}
