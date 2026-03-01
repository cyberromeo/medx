import { databases, users } from "@/lib/server/appwrite";
import { Query, ID } from "node-appwrite";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

// POST: Award 5 XP daily login bonus to all existing users (one-time migration)
export async function POST() {
    try {
        const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
        const PROGRESS_COL_ID = process.env.NEXT_PUBLIC_APPWRITE_PROGRESS_COLLECTION_ID;
        const today = new Date().toISOString().split('T')[0];
        const loginId = `daily_login_${today}`;

        // Get all progress records to find unique user IDs
        const response = await databases.listDocuments(DB_ID, PROGRESS_COL_ID, [
            Query.limit(5000)
        ]);

        // Get unique user IDs
        const userIds = [...new Set(response.documents.map(doc => doc.userId))];

        // Check which users already have today's login bonus
        const existingLogins = await databases.listDocuments(DB_ID, PROGRESS_COL_ID, [
            Query.equal('videoId', loginId),
            Query.limit(5000)
        ]);
        const alreadyClaimed = new Set(existingLogins.documents.map(doc => doc.userId));

        // Award 5 XP to users who haven't claimed yet
        let awarded = 0;
        for (const userId of userIds) {
            if (alreadyClaimed.has(userId)) continue;

            try {
                await databases.createDocument(DB_ID, PROGRESS_COL_ID, ID.unique(), {
                    userId,
                    videoId: loginId,
                    watchedAt: new Date().toISOString(),
                    xpEarned: 5
                });
                awarded++;
            } catch (e) {
                console.error(`Failed to award XP to ${userId}:`, e.message);
            }
        }

        return NextResponse.json({
            message: `Awarded 5 XP to ${awarded} users`,
            totalUsers: userIds.length,
            alreadyClaimed: alreadyClaimed.size,
            newlyAwarded: awarded
        });
    } catch (error) {
        console.error("Migration error:", error);
        return NextResponse.json({ error: "Migration failed" }, { status: 500 });
    }
}
