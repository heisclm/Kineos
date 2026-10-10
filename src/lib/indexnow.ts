import { slugify } from "./utils";

export const DEFAULT_INDEXNOW_KEY = "4a8c88f4e66d400fb86b1060934cf74e";

export function getIndexNowKey(): string {
  return process.env.INDEXNOW_KEY || DEFAULT_INDEXNOW_KEY;
}

export function getSiteHost(): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.kineos.fun";
  try {
    return new URL(siteUrl).hostname;
  } catch {
    return "www.kineos.fun";
  }
}

export function getSiteBaseUrl(): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.kineos.fun";
  return siteUrl.replace(/\/+$/, "");
}

/**
 * Notifies search engines (Bing, Yandex, Naver, Seznam, and IndexNow network)
 * instantly when new pages are published or updated on Kineos.
 */
export async function notifyIndexNow(urls: string[]): Promise<{
  success: boolean;
  submitted: number;
  message?: string;
}> {
  if (!urls || urls.length === 0) {
    return { success: true, submitted: 0 };
  }

  const host = getSiteHost();
  const key = getIndexNowKey();
  const baseUrl = getSiteBaseUrl();

  // Normalize URLs and ensure uniqueness
  const uniqueUrls = Array.from(
    new Set(
      urls.map((u) => {
        if (u.startsWith("http://") || u.startsWith("https://")) {
          return u;
        }
        return `${baseUrl}${u.startsWith("/") ? "" : "/"}${u}`;
      })
    )
  );

  const payload = {
    host,
    key,
    keyLocation: `https://${host}/${key}.txt`,
    urlList: uniqueUrls,
  };

  try {
    console.log(`[IndexNow] Submitting ${uniqueUrls.length} URLs to IndexNow API for host: ${host}`);

    const response = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok || response.status === 200 || response.status === 202) {
      console.log(`[IndexNow] Successfully submitted ${uniqueUrls.length} URLs (HTTP ${response.status})`);
      return { success: true, submitted: uniqueUrls.length };
    } else {
      const errText = await response.text().catch(() => "");
      console.warn(`[IndexNow] API responded with HTTP ${response.status}: ${errText}`);
      return { success: false, submitted: 0, message: `HTTP ${response.status}: ${errText}` };
    }
  } catch (error: any) {
    console.error("[IndexNow] Failed to ping IndexNow API:", error.message);
    return { success: false, submitted: 0, message: error.message };
  }
}

/**
 * Convenience helper to ping IndexNow when a movie or series is published,
 * including its cast hub pages and catalog indexes.
 */
export async function pingContentPublished(params: {
  type: "movie" | "series";
  slug: string;
  castNames?: string[];
}) {
  try {
    const baseUrl = getSiteBaseUrl();
    const urls: string[] = [
      `${baseUrl}/${params.type === "series" ? "series" : "movies"}/${params.slug}`,
      `${baseUrl}/${params.type === "series" ? "series" : "movies"}`,
      `${baseUrl}/catalog`,
      `${baseUrl}/cast`,
      `${baseUrl}`,
    ];

    if (params.castNames && params.castNames.length > 0) {
      for (const name of params.castNames.slice(0, 15)) {
        if (name && name.trim()) {
          urls.push(`${baseUrl}/cast/${slugify(name.trim())}`);
        }
      }
    }

    return await notifyIndexNow(urls);
  } catch (err: any) {
    console.error("[IndexNow] Error in pingContentPublished:", err.message);
    return { success: false, submitted: 0 };
  }
}
