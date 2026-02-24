import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { password } = await req.json();
  // console.log('clicked11')

  if (password === process.env.APP_PASSWORD) {
    const cookieStore = await cookies();
    
    // Set a secure, 30-day cookie
    cookieStore.set("farda_session", password, {
      httpOnly: true,
      secure: true,
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: false }, { status: 401 });
}