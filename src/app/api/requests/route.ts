import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contentRequests } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, contentType = "movie", releaseYear, notes, requesterEmail } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ success: false, error: "Title is required" }, { status: 400 });
    }

    const inserted = await db
      .insert(contentRequests)
      .values({
        title: title.trim(),
        contentType: contentType === "series" ? "series" : "movie",
        releaseYear: releaseYear ? parseInt(releaseYear, 10) || null : null,
        notes: notes ? String(notes).trim().slice(0, 1000) : null,
        requesterEmail: requesterEmail ? String(requesterEmail).trim().slice(0, 255) : null,
        status: "pending",
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "Your request has been submitted! Our team will index and upload this title soon.",
      data: inserted[0],
    });
  } catch (error: any) {
    console.error("Error creating content request:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit request. Please try again later." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const requests = await db
      .select()
      .from(contentRequests)
      .orderBy(desc(contentRequests.createdAt))
      .limit(100);

    return NextResponse.json({ success: true, data: requests });
  } catch (error) {
    console.error("Error fetching content requests:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch requests" }, { status: 500 });
  }
}
