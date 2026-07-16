import { adminDb } from "@/lib/server/firebase";
import { NextResponse } from "next/server";

// POST - Validate and consume an activation code
export async function POST(request) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Activation code is required" }, { status: 400 });
    }

    const normalizedCode = code.trim().toUpperCase();
    const docRef = adminDb.collection("activationCodes").doc(normalizedCode);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ valid: false, error: "Invalid activation code" }, { status: 400 });
    }

    const data = docSnap.data();

    if (data.used) {
      return NextResponse.json({ valid: false, error: "This activation code has already been used" }, { status: 400 });
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error("Error validating activation code:", error);
    return NextResponse.json({ error: "Failed to validate code" }, { status: 500 });
  }
}
