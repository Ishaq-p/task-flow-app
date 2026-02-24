// app/api/data/import/route.js
import { NextResponse } from "next/server";
import { getProjects, kvImport } from "../../../../lib/kv";

export async function POST(req) {
  try {
    const { projects: incoming, mode = "merge" } = await req.json();
    if (!Array.isArray(incoming)) {
      return NextResponse.json({ error: "Expected { projects: [...] }" }, { status: 400 });
    }
    await kvImport(incoming, mode);
    const projects = await getProjects();
    return NextResponse.json({ projects });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}