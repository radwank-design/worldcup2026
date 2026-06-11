import { NextRequest, NextResponse } from "next/server";
import { getScores, mergeScores } from "@/lib/kv";

// Always read/write live from KV — never serve a cached response.
export const dynamic = "force-dynamic";

export async function GET() {
  const scores = await getScores();
  return NextResponse.json(scores);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const updated = await mergeScores(body);
  return NextResponse.json(updated);
}
