// app/api/projects/[id]/reorder/route.js
import { NextResponse } from "next/server";
import { getProjects, kvReorderTasks } from "../../../../../lib/kv";

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const { orderedIds } = await req.json();
    if (!Array.isArray(orderedIds)) return NextResponse.json({ error: "orderedIds must be an array" }, { status: 400 });
    await kvReorderTasks(id, orderedIds);
    const projects = await getProjects();
    return NextResponse.json({ projects });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}