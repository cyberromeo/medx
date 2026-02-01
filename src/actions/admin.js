"use server";

import { users, databases } from "@/lib/server/appwrite";
import { Query } from "node-appwrite";

export async function getAdminStats() {
    try {
        // 1. Total Users
        const usersList = await users.list();
        const totalUsers = usersList.total;

        // 2. Active Users (Accessed in last 15 mins)
        // Note: 'accessedAt' format is ISO 8601. 
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
        const activeUsersList = await users.list([
            Query.greaterThan("accessedAt", fifteenMinutesAgo)
        ]);
        const activeUsers = activeUsersList.total;

        // 3. Total Videos
        const videosList = await databases.listDocuments(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
            process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID,
            [Query.limit(1)] // Optimization: we only care about total
        );
        const totalVideos = videosList.total;

        return {
            totalUsers,
            activeUsers,
            totalVideos
        };
    } catch (error) {
        console.error("Failed to fetch admin stats:", error);
        return {
            totalUsers: 0,
            activeUsers: 0,
            totalVideos: 0,
            error: error.message
        };
    }
}
