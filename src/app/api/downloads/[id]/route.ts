import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { downloadSources, downloadHistory, profiles } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const downloadSourceId = params.id;

  if (!downloadSourceId) {
    return new NextResponse("Invalid download ID", { status: 400 });
  }

  // 1. Fetch the Download Source
  const sourceRecord = await db
    .select()
    .from(downloadSources)
    .where(eq(downloadSources.id, downloadSourceId))
    .limit(1);

  if (sourceRecord.length === 0) {
    return new NextResponse("Download source not found", { status: 404 });
  }

  const source = sourceRecord[0];

  if (!source.url) {
    return new NextResponse("Download link unavailable", { status: 404 });
  }

  // 2. Optional user tracking (public downloads are fully allowed without authentication)
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (userId) {
      const profile = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1);
      if (profile.length === 0) {
        await db.insert(profiles).values({ id: userId });
      }
      await db.insert(downloadHistory).values({
        userId,
        downloadSourceId,
      });
    }
  } catch (e) {
    // Non-blocking for analytics/download history
  }

  const isMagnet = source.sourceType === "TORRENT_MAGNET" || source.url.startsWith("magnet:");

  // 3. For Torrent Magnet URIs, return an HTML launcher page.
  // Browsers frequently block or display errors on HTTP 302/307 redirects to custom URI schemes (magnet:).
  // This launcher page ensures instant auto-launch via JS + meta refresh, plus a manual button fallback.
  if (isMagnet) {
    const safeTitle = source.label || (source.quality ? `Episode (${source.quality})` : "Torrent Download");
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="refresh" content="0;url=${encodeURI(source.url)}" />
  <title>Opening Torrent - Kineos</title>
  <style>
    * { box-sizing: border-box; }
    body {
      background-color: #09090b;
      color: #f4f4f5;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 1rem;
    }
    .card {
      background: #121215;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 1.25rem;
      padding: 2.25rem 1.75rem;
      max-width: 440px;
      width: 100%;
      text-align: center;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
    }
    .icon {
      width: 52px;
      height: 52px;
      margin: 0 auto 1.25rem auto;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #34d399;
    }
    h1 {
      font-size: 1.25rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
      color: #ffffff;
      letter-spacing: -0.01em;
    }
    p {
      font-size: 0.875rem;
      color: #a1a1aa;
      margin: 0 0 1.5rem 0;
      line-height: 1.5;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      width: 100%;
      background: #e50914;
      color: #ffffff;
      padding: 0.85rem 1.25rem;
      border-radius: 0.75rem;
      font-weight: 600;
      text-decoration: none;
      font-size: 0.9375rem;
      transition: background 0.15s ease, transform 0.15s ease;
      box-shadow: 0 4px 14px rgba(229, 9, 20, 0.4);
    }
    .btn:hover {
      background: #dc2626;
      transform: translateY(-1px);
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"></path>
        <line x1="4" y1="7" x2="8" y2="7"></line>
        <line x1="16" y1="7" x2="20" y2="7"></line>
      </svg>
    </div>
    <h1>Opening Torrent Client...</h1>
    <p>Opening ${safeTitle} in your default torrent app (qBittorrent, BitTorrent, uTorrent, Flud). If it didn't open automatically, click below:</p>
    <a href="${source.url}" class="btn">
      Launch Magnet Link
    </a>
  </div>
  <script>
    try {
      window.location.href = ${JSON.stringify(source.url)};
    } catch (e) {}
    setTimeout(function() {
      if (window.opener && !document.hidden) {
        window.close();
      }
    }, 3500);
  </script>
</body>
</html>`;

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  }

  // 4. Redirect to the direct file URL (R2, direct download link, etc.)
  return NextResponse.redirect(source.url);
}
