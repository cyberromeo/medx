import { adminDb, adminAuth } from "@/lib/server/firebase";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// POST: Award 5 XP daily login bonus to all registered users (one-time migration)
export async function POST() {
  try {
    const PROGRESS_COL_ID = "user_progress";
    const today = new Date().toISOString().split("T")[0];
    const loginId = `daily_login_${today}`;

    // Get ALL registered users from Firebase Auth
    let allUsers = [];
    let pageToken = undefined;
    do {
      const result = await adminAuth.listUsers(1000, pageToken);
      allUsers.push(...result.users);
      pageToken = result.pageToken;
    } while (pageToken);

    // Check which users already have today's login bonus
    const existingLoginsSnapshot = await adminDb
      .collection(PROGRESS_COL_ID)
      .where("videoId", "==", loginId)
      .limit(5000)
      .get();

    const alreadyClaimed = new Set(
      existingLoginsSnapshot.docs.map((doc) => doc.data().userId),
    );

    // Award 5 XP to users who haven't claimed yet
    let awarded = 0;
    for (const user of allUsers) {
      if (alreadyClaimed.has(user.uid)) continue;

      try {
        await adminDb.collection(PROGRESS_COL_ID).add({
          userId: user.uid,
          videoId: loginId,
          watchedAt: new Date().toISOString(),
          xpEarned: 5,
        });
        awarded++;
      } catch (e) {
        console.error(`Failed to award XP to ${user.uid}:`, e.message);
      }
    }

    return NextResponse.json({
      message: `Awarded 5 XP to ${awarded} users`,
      totalRegistered: allUsers.length,
      alreadyClaimed: alreadyClaimed.size,
      newlyAwarded: awarded,
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json({ error: "Migration failed" }, { status: 500 });
  }
}
