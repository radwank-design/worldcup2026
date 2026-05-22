import { NextRequest, NextResponse } from "next/server";
import { mergeScores } from "@/lib/kv";

// Protected manual score override endpoint.
// Usage: curl -X POST https://your-domain.vercel.app/api/admin/update \
//   -H "Authorization: Bearer $ADMIN_SECRET" \
//   -H "Content-Type: application/json" \
//   -d '{"A|Mexico|South Africa":{"homeScore":2,"awayScore":1}}'
export async function POST(req: NextRequest) {
  const secret = process.env.ADMIN_SECRET;
  const auth = req.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const updated = await mergeScores(body);
  return NextResponse.json({ ok: true, total: Object.keys(updated).length });
}
