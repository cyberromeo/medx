import { adminDb } from "@/lib/server/firebase";
import { NextResponse } from "next/server";

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// GET - List all activation codes
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const password = searchParams.get("password");

    if (password !== "superstudiopro") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const snapshot = await adminDb
      .collection("activationCodes")
      .orderBy("createdAt", "desc")
      .get();

    const codes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
      usedAt: doc.data().usedAt?.toDate?.()?.toISOString() || doc.data().usedAt || null,
    }));

    return NextResponse.json({ codes });
  } catch (error) {
    console.error("Error fetching activation codes:", error);
    return NextResponse.json({ error: "Failed to fetch codes" }, { status: 500 });
  }
}

// POST - Generate new activation code(s)
export async function POST(request) {
  try {
    const body = await request.json();
    const { password, count = 1 } = body;

    if (password !== "superstudiopro") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const generatedCodes = [];
    const batch = adminDb.batch();

    for (let i = 0; i < Math.min(count, 50); i++) {
      const code = generateCode();
      const docRef = adminDb.collection("activationCodes").doc(code);
      batch.set(docRef, {
        code,
        used: false,
        usedBy: null,
        usedByEmail: null,
        usedAt: null,
        createdAt: new Date(),
      });
      generatedCodes.push(code);
    }

    await batch.commit();

    return NextResponse.json({ codes: generatedCodes });
  } catch (error) {
    console.error("Error generating activation codes:", error);
    return NextResponse.json({ error: "Failed to generate codes" }, { status: 500 });
  }
}
