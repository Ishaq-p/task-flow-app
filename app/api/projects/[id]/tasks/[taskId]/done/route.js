// app/api/projects/[id]/tasks/[taskId]/done/route.js
import { NextResponse } from "next/server";
import { getProjects, kvToggleTaskDone } from "../../../../../../../lib/kv";

export async function POST(req, { params }) {
  try {
    const { id, taskId } = await params;
    const task = await kvToggleTaskDone(id, taskId);
    if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const projects = await getProjects();
    return NextResponse.json({ task, projects });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}