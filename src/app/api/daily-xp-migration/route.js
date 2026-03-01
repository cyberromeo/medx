import { databases, users } from "@/lib/server/appwrite";
import { Query, ID } from "node-appwrite";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

// POST: Award 5 XP daily login bonus to all registered users (one-time migration)
export async function POST() {
    try {
        const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
        const PROGRESS_COL_ID = process.env.NEXT_PUBLIC_APPWRITE_PROGRESS_COLLECTION_ID;
        const today = new Date().toISOString().split('T')[0];
        const loginId = `daily_login_${today}`;

        // Get ALL registered users from Appwrite auth
        let allUsers = [];
        let offset = 0;
        const batchSize = 100;
        while (true) {
            const batch = await users.list([
                Query.limit(batchSize),
                Query.offset(offset)
            ]);
            allUsers.push(...batch.users);
            if (batch.users.length < batchSize) break;
            offset += batchSize;
        }

        // Check which users already have today's login bonus
        const existingLogins = await databases.listDocuments(DB_ID, PROGRESS_COL_ID, [
            Query.equal('videoId', loginId),
            Query.limit(5000)
        ]);
        const alreadyClaimed = new Set(existingLogins.documents.map(doc => doc.userId));

        // Award 5 XP to users who haven't claimed yet
        let awarded = 0;
        for (const user of allUsers) {
            if (alreadyClaimed.has(user.$id)) continue;

            try {
                await databases.createDocument(DB_ID, PROGRESS_COL_ID, ID.unique(), {
                    userId: user.$id,
                    videoId: loginId,
                    watchedAt: new Date().toISOString(),
                    xpEarned: 5
                });
                awarded++;
            } catch (e) {
                console.error(`Failed to award XP to ${user.$id}:`, e.message);
            }
        }

        return NextResponse.json({
            message: `Awarded 5 XP to ${awarded} users`,
            totalRegistered: allUsers.length,
            alreadyClaimed: alreadyClaimed.size,
            newlyAwarded: awarded
        });
    } catch (error) {
        console.error("Migration error:", error);
        return NextResponse.json({ error: "Migration failed" }, { status: 500 });
    }
}
