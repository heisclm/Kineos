"use server";

import { db } from "@/lib/db";
import { downloadSources } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function addDownloadSource(formData: FormData) {
  try {
    const contentId = formData.get("contentId") as string;
    const contentType = formData.get("contentType") as "movie" | "series" | "episode";
    const sourceType = formData.get("sourceType") as string;
    const url = formData.get("url") as string;
    const label = formData.get("label") as string;
    const quality = formData.get("quality") as string;
    const format = formData.get("format") as string;
    const language = formData.get("language") as string;
    const fileSize = parseInt((formData.get("fileSize") as string) || "0");
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

    revalidatePath(`/admin/${contentType === "movie" ? "movies" : "series"}/${contentId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Failed to add download source:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteDownloadSource(id: string, contentId: string, contentType: "movie" | "series" | "episode") {
  try {
    // Note: If CLOUDFLARE_R2, this would also delete the object from R2 (not fully implemented in MVP)
    await db.delete(downloadSources).where(eq(downloadSources.id, id));
    revalidatePath(`/admin/${contentType === "movie" ? "movies" : "series"}/${contentId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleDownloadSource(id: string, isActive: boolean, contentId: string, contentType: "movie" | "series" | "episode") {
  try {
    await db.update(downloadSources).set({ isActive }).where(eq(downloadSources.id, id));
    revalidatePath(`/admin/${contentType === "movie" ? "movies" : "series"}/${contentId}`);
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
  // In a real app, this generates a signed URL using AWS S3 SDK connecting to Cloudflare R2.
  // For the MVP demonstration, we return a mock URL.
  // The actual upload will be intercepted and simulated by the client.
  return {
    success: true,
    uploadUrl: "https://mock-r2-endpoint.cloudflare.com/upload",
    storageKey: `media/${Date.now()}-${filename}`
  };
}
