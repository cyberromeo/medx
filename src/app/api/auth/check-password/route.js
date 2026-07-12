import { adminAuth } from "@/lib/server/firebase";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    try {
      const user = await adminAuth.getUserByEmail(email);
      // If user has no passwordHash, they don't have a password set
      const hasPassword = !!user.passwordHash;
      return NextResponse.json({ hasPassword });
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        return NextResponse.json({ hasPassword: false, notFound: true });
      }
      throw error;
    }
  } catch (error) {
    console.error("Error in check-password:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
