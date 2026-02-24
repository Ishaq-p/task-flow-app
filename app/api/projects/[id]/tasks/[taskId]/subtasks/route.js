// app/api/projects/[id]/tasks/[taskId]/subtasks/route.js
import { NextResponse } from "next/server";
import { getProjects, kvCreateSubtask } from "../../../../../../../lib/kv";

export async function POST(req, { params }) {
  try {
    const { id, taskId } = await params;
    const { title } = await req.json();
    if (!title?.trim()) return NextResponse.json({ error: "Title required" }, { status: 400 });
    const subtask = await kvCreateSubtask(id, taskId, title.trim());
    if (!subtask) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const projects = await getProjects();
    return NextResponse.json({ subtask, projects }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}