import { adminDb } from "@/lib/server/firebase";
import { NextResponse } from "next/server";

const PASSWORD = "superstudiopro";

// GET /api/studytime/logs?password=superstudiopro&limit=50
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const password = searchParams.get("password");
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));

    if (password !== PASSWORD) {
      return NextResponse.json({ error: "Unauthorized. Incorrect password." }, { status: 401 });
    }

    if (!adminDb) {
      return NextResponse.json({ error: "Database connection unavailable" }, { status: 500 });
    }

    const snapshot = await adminDb
      .collection("studyTimeLogs")
      .orderBy("timestamp", "desc")
      .limit(limit)
      .get();

    const logs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ success: true, count: logs.length, logs });
  } catch (error) {
    console.error("Error in GET /api/studytime/logs:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch logs" }, { status: 500 });
  }
}

// POST /api/studytime/logs (action: clear)
export async function POST(request) {
  try {
    const body = await request.json();
    const { password, action } = body;

    if (password !== PASSWORD) {
      return NextResponse.json({ error: "Unauthorized. Incorrect password." }, { status: 401 });
    }

    if (!adminDb) {
      return NextResponse.json({ error: "Database connection unavailable" }, { status: 500 });
    }

    if (action === "clear") {
      const snapshot = await adminDb.collection("studyTimeLogs").get();
      const batch = adminDb.batch();
      snapshot.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();

      return NextResponse.json({ success: true, message: "Study time logs cleared successfully" });
    }

    return NextResponse.json({ error: "Invalid action. Supported: clear" }, { status: 400 });
  } catch (error) {
    console.error("Error in POST /api/studytime/logs:", error);
    return NextResponse.json({ error: error.message || "Failed to process logs action" }, { status: 500 });
  }
}
