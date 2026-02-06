import { databases, users } from "@/lib/server/appwrite";
import { Query } from "node-appwrite";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
        const PROGRESS_COL_ID = process.env.NEXT_PUBLIC_APPWRITE_PROGRESS_COLLECTION_ID;

        // Fetch all progress records (admin access bypasses RLS)
        // Note: For production, we should implement pagination or aggregation queries
        const response = await databases.listDocuments(DB_ID, PROGRESS_COL_ID, [
            Query.limit(5000) // Increase limit to capture more history
        ]);



        // Aggregate XP per user
        const userXpMap = {};
        const userLastActiveMap = {};

        for (const doc of response.documents) {
            const userId = doc.userId;
            userXpMap[userId] = (userXpMap[userId] || 0) + (doc.xpEarned || 100);

            // Track last active
            const docDate = new Date(doc.watchedAt || doc.$createdAt).getTime();
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
                    const userData = await users.get(user.userId);
                    return {
                        ...user,
                        displayName: userData.name || `Dr. ${user.userId.slice(0, 6)}...`
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
        jsonResponse.headers.set('X-Debug-Doc-Count', response.documents?.length || 0);
        jsonResponse.headers.set('X-Debug-User-Count', userIds.length);
        jsonResponse.headers.set('X-Debug-Key-Status', process.env.APPWRITE_API_KEY ? 'Present' : 'Missing');

        return jsonResponse;
    } catch (error) {
        console.error("Leaderboard API Error:", error);
        return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
    }
}
