// app/api/projects/[id]/bulk/route.js
import { NextResponse } from "next/server";
import { getProjects, kvBulkUpdateTasks, kvBulkDeleteTasks } from "../../../../../lib/kv";

// POST → bulk update (mark done, toggle highlight)
export async function POST(req, { params }) {
  try {
    const { id }     = await params;
    const { taskIds, ...ops } = await req.json();
    if (!Array.isArray(taskIds)) return NextResponse.json({ error: "taskIds required" }, { status: 400 });
    await kvBulkUpdateTasks(id, taskIds, ops);
    const projects = await getProjects();
    return NextResponse.json({ projects });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE → bulk delete
export async function DELETE(req, { params }) {
  try {
    const { id }     = await params;
    const { taskIds } = await req.json();
    if (!Array.isArray(taskIds)) return NextResponse.json({ error: "taskIds required" }, { status: 400 });
    await kvBulkDeleteTasks(id, taskIds);
    const projects = await getProjects();
    return NextResponse.json({ projects });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}