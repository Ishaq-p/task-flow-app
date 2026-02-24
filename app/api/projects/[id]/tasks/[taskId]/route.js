// app/api/projects/[id]/tasks/[taskId]/route.js
import { NextResponse } from "next/server";
import { getProjects, kvUpdateTask, kvDeleteTask } from "../../../../../../lib/kv";

export async function PATCH(req, { params }) {
  try {
    const { id, taskId } = await params;
    const body  = await req.json();
    const task  = await kvUpdateTask(id, taskId, body);
    if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const projects = await getProjects();
    return NextResponse.json({ task, projects });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id, taskId } = await params;
    await kvDeleteTask(id, taskId);
    const projects = await getProjects();
    return NextResponse.json({ projects });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}