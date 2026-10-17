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

/**
 * Robust cross-browser clipboard copy function with fallback for iOS Safari and non-secure contexts.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  // 1. Modern navigator.clipboard API
  if (typeof navigator !== "undefined" && navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn("navigator.clipboard.writeText failed, attempting fallback:", err);
    }
  }

  // 2. Reliable fallback for iOS Safari and older webviews
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.width = "2em";
    textArea.style.height = "2em";
    textArea.style.padding = "0";
    textArea.style.border = "none";
    textArea.style.outline = "none";
    textArea.style.boxShadow = "none";
    textArea.style.background = "transparent";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, text.length);
    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error("Clipboard copy failed:", err);
    return false;
  }
}

/**
 * Checks whether the current client is running on an iOS device (iPhone, iPad, iPod).
 */
export function isIOSDevice(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}
