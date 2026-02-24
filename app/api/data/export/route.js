// app/api/data/export/route.js
import { NextResponse } from "next/server";
import { kvExport } from "../../../../lib/kv";

export async function GET() {
  try {
    const payload = await kvExport();
    return NextResponse.json(payload);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}