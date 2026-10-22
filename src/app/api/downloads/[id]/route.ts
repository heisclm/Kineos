import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Direct file downloads have been sunset in favor of official licensed streaming options
  return NextResponse.json(
    {
      error: "Direct downloads have been discontinued.",
      message:
        "Kineos provides official streaming and digital storefront links powered by TMDB and JustWatch.",
    },
    { status: 410 }
  );
}
