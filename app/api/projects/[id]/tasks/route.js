// app/api/projects/[id]/tasks/route.js
import { NextResponse } from "next/server";
import { getProjects, kvCreateTask } from "../../../../../lib/kv";

export async function POST(req, { params }) {
  try {
    const { id } = await params;
    const body   = await req.json();
    const task   = await kvCreateTask(id, body);
    if (!task) return NextResponse.json({ error: "Project not found" }, { status: 404 });
    const projects = await getProjects();
    return NextResponse.json({ task, projects }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}