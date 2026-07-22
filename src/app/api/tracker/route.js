import { adminDb, initError } from "@/lib/server/firebase";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const TRACKER_COL = "user_tracker";
const DEFAULT_USER_ID = "NpFFvozZSFWnCKdmutkISEGPf8o2";

function getCorsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(),
  });
}

export async function GET(request) {
  const headers = getCorsHeaders();
  try {
    if (initError || !adminDb) {
      return NextResponse.json(
        { error: "Firebase Admin Initialization Failed", details: initError },
        { status: 500, headers }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || DEFAULT_USER_ID;

    const docRef = adminDb.collection(TRACKER_COL).doc(userId);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      return NextResponse.json(docSnap.data(), { headers });
    } else {
      return NextResponse.json({ subjects: {}, gts: {} }, { headers });
    }
  } catch (error) {
    console.error("Tracker GET API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tracker data", details: error.message },
      { status: 500, headers }
    );
  }
}

export async function POST(request) {
  const headers = getCorsHeaders();
  try {
    if (initError || !adminDb) {
      return NextResponse.json(
        { error: "Firebase Admin Initialization Failed", details: initError },
        { status: 500, headers }
      );
    }

    const body = await request.json();
    const userId = body.userId || DEFAULT_USER_ID;
    const docRef = adminDb.collection(TRACKER_COL).doc(userId);

    if (body.subject && body.field !== undefined) {
      const { subject, field, value } = body;
      await docRef.set(
        {
          subjects: {
            [subject]: {
              [field]: Boolean(value),
            },
          },
        },
        { merge: true }
      );
      return NextResponse.json({ success: true }, { headers });
    } else if (body.gt !== undefined) {
      const { gt, value } = body;
      await docRef.set(
        {
          gts: {
            [gt]: Boolean(value),
          },
        },
        { merge: true }
      );
      return NextResponse.json({ success: true }, { headers });
    } else if (body.subjects || body.gts) {
      await docRef.set(
        {
          ...(body.subjects ? { subjects: body.subjects } : {}),
          ...(body.gts ? { gts: body.gts } : {}),
        },
        { merge: true }
      );
      return NextResponse.json({ success: true }, { headers });
    }

    return NextResponse.json(
      { error: "Invalid payload" },
      { status: 400, headers }
    );
  } catch (error) {
    console.error("Tracker POST API Error:", error);
    return NextResponse.json(
      { error: "Failed to update tracker data", details: error.message },
      { status: 500, headers }
    );
  }
}
