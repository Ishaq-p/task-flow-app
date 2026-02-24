// app/api/projects/[id]/route.js
import { NextResponse } from "next/server";
import { getProjects, kvUpdateProject, kvDeleteProject } from "../../../../lib/kv";

export async function PATCH(req, { params }) {
  try {
    const { id }   = await params;
    const body     = await req.json();
    const project  = await kvUpdateProject(id, body);
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const projects = await getProjects();
    return NextResponse.json({ project, projects });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    await kvDeleteProject(id);
    const projects = await getProjects();
    return NextResponse.json({ projects });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}