import { adminDb } from "@/lib/server/firebase";
import { NextResponse } from "next/server";

// POST - Redeem (consume) an activation code after successful account creation
export async function POST(request) {
  try {
    const body = await request.json();
    const { code, userId, email } = body;

    if (!code || !userId) {
      return NextResponse.json({ error: "Code and userId are required" }, { status: 400 });
    }

    const normalizedCode = code.trim().toUpperCase();
    const docRef = adminDb.collection("activationCodes").doc(normalizedCode);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: "Invalid activation code" }, { status: 400 });
    }

    const data = docSnap.data();

    if (data.used) {
      return NextResponse.json({ error: "This activation code has already been used" }, { status: 400 });
    }

    // Mark the code as used
    await docRef.update({
      used: true,
      usedBy: userId,
      usedByEmail: email || null,
      usedAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error redeeming activation code:", error);
    return NextResponse.json({ error: "Failed to redeem code" }, { status: 500 });
  }
}
