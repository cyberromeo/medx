// Progress tracking utilities with Appwrite backend

import { databases, account } from './appwrite';
import { ID, Query } from 'appwrite';

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const PROGRESS_COL_ID = process.env.NEXT_PUBLIC_APPWRITE_PROGRESS_COLLECTION_ID;

// Cache for progress data
let progressCache = null;
let cacheUserId = null;

// Get current user's progress from Appwrite
export const getProgress = async (userId = null) => {
    // If no userId provided, try to get from cache or return empty
    if (!userId && cacheUserId && progressCache) {
        return progressCache;
    }

    if (!userId) {
        return { watched: [], xp: 0, streak: 0, lastWatch: null };
    }

    try {
        const response = await databases.listDocuments(DB_ID, PROGRESS_COL_ID, [
            Query.equal('userId', userId),
            Query.orderDesc('watchedAt'),
            Query.limit(500)
        ]);

        const watched = response.documents.map(doc => doc.videoId);
        const xp = response.documents.reduce((sum, doc) => sum + (doc.xpEarned || 100), 0);
        const lastWatch = response.documents.length > 0 ? response.documents[0].watchedAt : null;

        // Calculate streak
        const streak = calculateStreak(response.documents);

        progressCache = { watched, xp, streak, lastWatch };
        cacheUserId = userId;

        return progressCache;
    } catch (error) {
        console.error('Error fetching progress:', error);
        return { watched: [], xp: 0, streak: 0, lastWatch: null };
    }
};

// Calculate day streak from watch history
const calculateStreak = (documents) => {
    if (documents.length === 0) return 0;

    const uniqueDays = [...new Set(
        documents.map(doc => new Date(doc.watchedAt).toDateString())
    )].sort((a, b) => new Date(b) - new Date(a));

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < uniqueDays.length; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);

        if (uniqueDays.includes(checkDate.toDateString())) {
            streak++;
        } else if (i === 0) {
            // Today not yet watched, check if yesterday was watched
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            if (!uniqueDays.includes(yesterday.toDateString())) {
                break;
            }
        } else {
            break;
        }
    }

    return streak;
};

// Mark a video as watched and award XP
export const markVideoWatched = async (videoId, userId) => {
    if (!userId || !videoId) {
        return getProgress(userId);
    }

    try {
        // Check if already watched
        const existing = await databases.listDocuments(DB_ID, PROGRESS_COL_ID, [
            Query.equal('userId', userId),
            Query.equal('videoId', videoId),
            Query.limit(1)
        ]);

        if (existing.documents.length > 0) {
            // Already watched, return current progress
            return getProgress(userId);
        }

        // Calculate bonus XP for streak
        const currentProgress = await getProgress(userId);
        const streakBonus = Math.min(currentProgress.streak * 10, 100);
        const xpEarned = 100 + (currentProgress.streak > 0 ? streakBonus : 0);

        // Create new watch record
        await databases.createDocument(DB_ID, PROGRESS_COL_ID, ID.unique(), {
            userId,
            videoId,
            watchedAt: new Date().toISOString(),
            xpEarned
        });

        // Invalidate cache
        progressCache = null;

        // Return updated progress
        return getProgress(userId);
    } catch (error) {
        console.error('Error marking video watched:', error);
        return getProgress(userId);
    }
};

// Check if a video is watched
export const isVideoWatched = (watchedIds, videoId) => {
    return watchedIds.includes(videoId);
};

// Calculate level from XP
export const calculateLevel = (xp) => {
    return Math.floor(xp / 500) + 1;
};

// Get XP progress to next level
export const getXpToNextLevel = (xp) => {
    const currentLevelXp = (calculateLevel(xp) - 1) * 500;
    return { current: xp - currentLevelXp, needed: 500 };
};

// Clear cache (call on logout)
export const clearProgressCache = () => {
    progressCache = null;
    cacheUserId = null;
};
