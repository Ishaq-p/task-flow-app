// app/api/projects/[id]/tasks/[taskId]/subtasks/[subtaskId]/route.js
import { NextResponse } from "next/server";
import { getProjects, kvToggleSubtask, kvDeleteSubtask } from "../../../../../../../../lib/kv";

export async function POST(req, { params }) {
  try {
    const { id, taskId, subtaskId } = await params;
    const sub = await kvToggleSubtask(id, taskId, subtaskId);
    if (!sub) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const projects = await getProjects();
    return NextResponse.json({ subtask: sub, projects });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id, taskId, subtaskId } = await params;
    await kvDeleteSubtask(id, taskId, subtaskId);
    const projects = await getProjects();
    return NextResponse.json({ projects });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}