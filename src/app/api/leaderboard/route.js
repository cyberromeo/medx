import { adminDb, adminAuth } from "@/lib/server/firebase";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const PROGRESS_COL_ID = "user_progress";

        // Fetch all progress records
        // Note: For production, we should implement pagination or aggregation queries
        const snapshot = await adminDb.collection(PROGRESS_COL_ID).limit(5000).get();

        // Aggregate XP per user
        const userXpMap = {};
        const userLastActiveMap = {};

        for (const doc of snapshot.docs) {
            const data = doc.data();
            const userId = data.userId;
            userXpMap[userId] = (userXpMap[userId] || 0) + (data.xpEarned || 100);

            // Track last active
            const docDate = new Date(data.watchedAt || data.createdAt).getTime();
            if (!userLastActiveMap[userId] || docDate > userLastActiveMap[userId]) {
                userLastActiveMap[userId] = docDate;
            }
        }

        const userIds = Object.keys(userXpMap);

        // Convert to array and sort
        let sortedUsers = userIds
            .map(userId => ({
                userId,
                xp: userXpMap[userId],
                level: Math.floor(userXpMap[userId] / 500) + 1,
                lastActive: userLastActiveMap[userId]
            }))
            .sort((a, b) => b.xp - a.xp)
            .slice(0, 50); // Top 50

        // Fetch display names for top users
        // We do this in parallel for performance
        const usersWithNames = await Promise.all(
            sortedUsers.map(async (user) => {
                try {
                    const userData = await adminAuth.getUser(user.userId);
                    return {
                        ...user,
                        displayName: userData.displayName || `Dr. ${user.userId.slice(0, 6)}...`
                    };
                } catch (e) {
                    return {
                        ...user,
                        displayName: `Dr. ${user.userId.slice(0, 6)}...`
                    };
                }
            })
        );

        const jsonResponse = NextResponse.json(usersWithNames);
        jsonResponse.headers.set('X-Debug-Doc-Count', snapshot.docs.length.toString());
        jsonResponse.headers.set('X-Debug-User-Count', userIds.length.toString());

        return jsonResponse;
    } catch (error) {
        console.error("Leaderboard API Error:", error);
        return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
    }
}
