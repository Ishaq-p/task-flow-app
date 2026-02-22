import { kv } from "@vercel/kv";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// We use the session cookie to ensure users only see THEIR tasks
async function getTaskKey() {
  const cookieStore = await cookies();
  const session = cookieStore.get("farda_session");
  // If no session, we return a guest key or block it
  return `tasks_${session?.value || 'guest_user'}`;
}

export async function GET() {
  try {
    const key = await getTaskKey();
    const tasks = await kv.get(key);
    // Vercel KV returns null if the key doesn't exist yet
    return NextResponse.json(tasks || []);
  } catch (error) {
    console.error("KV Fetch Error:", error);
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const key = await getTaskKey();
    const tasksArray = await req.json();
    
    // This writes the data to disk permanently
    await kv.set(key, tasksArray);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("KV Save Error:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}