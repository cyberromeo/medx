"use server";

import { adminDb, adminAuth } from "@/lib/server/firebase";

export async function getAdminStats() {
  try {
    let totalUsers = 0;
    let activeUsers = 0;
    let pageToken = undefined;

    const fifteenMinutesAgo = Date.now() - 15 * 60 * 1000;

    do {
      const listUsersResult = await adminAuth.listUsers(1000, pageToken);
      totalUsers += listUsersResult.users.length;

      listUsersResult.users.forEach((userRecord) => {
        const lastSignInTime = new Date(
          userRecord.metadata.lastSignInTime,
        ).getTime();
        if (lastSignInTime > fifteenMinutesAgo) {
          activeUsers++;
        }
      });
      pageToken = listUsersResult.pageToken;
    } while (pageToken);

    const videosSnapshot = await adminDb.collection("videos").count().get();
    const totalVideos = videosSnapshot.data().count;

    return {
      totalUsers,
      activeUsers,
      totalVideos,
    };
  } catch (error) {
    console.error("Failed to fetch admin stats:", error);
    return {
      totalUsers: 0,
      activeUsers: 0,
      totalVideos: 0,
      error: error.message,
    };
  }
}
