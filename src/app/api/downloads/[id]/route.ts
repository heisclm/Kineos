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

  // 1. Authenticate user
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'You must be logged in to download content.');
    return NextResponse.redirect(loginUrl);
  }

  const userId = session.user.id;

  // 2. Fetch the Download Source
  const sourceRecord = await db
    .select()
    .from(downloadSources)
    .where(eq(downloadSources.id, downloadSourceId))
    .limit(1);

  if (sourceRecord.length === 0) {
    return new NextResponse("Download source not found", { status: 404 });
  }

  const source = sourceRecord[0];

  // 3. Ensure profile exists (Sync with Auth if missed by trigger)
  try {
    const profile = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1);
    if (profile.length === 0) {
      await db.insert(profiles).values({ id: userId });
    }
  } catch (e) {
    console.warn("Profile sync issue during download", e);
  }

  // 4. Log the download history
  try {
    await db.insert(downloadHistory).values({
      userId,
      downloadSourceId,
    });
  } catch (e) {
    console.error("Failed to log download history", e);
    // Proceed anyway to not block the user's download
  }

  // 5. Redirect to the actual secure URL
  // In a full production app, you might sign an S3 URL here.
  // For MVP, we redirect to the stored URL.
  return NextResponse.redirect(source.url);
}
