// app/api/projects/route.js
import { NextResponse } from "next/server";
import { getProjects, kvCreateProject } from "../../../lib/kv";

export async function GET() {
  try {
    const projects = await getProjects();
    return NextResponse.json({ projects });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body    = await req.json();
    const project = await kvCreateProject(body);
    const projects = await getProjects();
    return NextResponse.json({ project, projects }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}