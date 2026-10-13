import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(minutes: number | null | undefined) {
  if (!minutes) return "";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}min`;
  if (h > 0) return `${h}h`;
  return `${m}min`;
}

export function formatBytes(mb: number | null | undefined) {
  if (!mb) return "";
  if (mb >= 1000) {
    return (mb / 1024).toFixed(1) + " GB";
  }
  return mb + " MB";
}

export function formatRawBytes(bytes: number | null | undefined): string {
  if (!bytes || bytes <= 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export function formatEta(ms: number | null | undefined): string {
  if (!ms || ms === Infinity || isNaN(ms) || ms < 0) return "Estimating...";
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSecs = seconds % 60;
  if (minutes < 60) return `${minutes}m ${remainingSecs}s`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

export function slugify(text: string): string {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

/**
 * Safely rewrites high-resolution TMDB image URLs to appropriate CDN thumbnail sizes.
 * If the image is not from TMDB (e.g. Supabase, Cloudflare R2), it returns the original URL untouched.
 */
export function getOptimizedImageUrl(
  url?: string | null,
  size: "w185" | "w342" | "w500" | "w780" | "original" = "w500"
): string {
  if (!url) return "";
  if (url.includes("image.tmdb.org/t/p/")) {
    return url.replace(/\/t\/p\/(original|w780|w1280|w500|w342|w185)/, `/t/p/${size}`);
  }
  return url;
}
