// Progress tracking utilities with Appwrite backend

import { databases, account } from './appwrite';
import { ID, Query } from 'appwrite';

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const PROGRESS_COL_ID = process.env.NEXT_PUBLIC_APPWRITE_PROGRESS_COLLECTION_ID;

// Cache for progress data
let progressCache = null;
let cacheUserId = null;

// Medical-themed level titles
const LEVEL_TITLES = [
    'Intern',        // 1
    'Junior Resident', // 2
    'Resident',      // 3
    'Senior Resident', // 4
    'Registrar',     // 5
    'Specialist',    // 6
    'Senior Specialist', // 7
    'Consultant',    // 8
    'Senior Consultant', // 9
    'Professor',     // 10+
];

// Get level title from level number
export const getLevelTitle = (level) => {
    const index = Math.min(level - 1, LEVEL_TITLES.length - 1);
    return LEVEL_TITLES[Math.max(0, index)];
};

// Calculate XP earned today from documents
const getTodayXp = (documents) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return documents
        .filter(doc => {
            const docDate = new Date(doc.watchedAt);
            docDate.setHours(0, 0, 0, 0);
            return docDate.getTime() === today.getTime();
        })
        .reduce((sum, doc) => sum + (doc.xpEarned || 100), 0);
};

// Get current user's progress from Appwrite
export const getProgress = async (userId = null) => {
    // If no userId provided, try to get from cache or return empty
    if (!userId && cacheUserId && progressCache) {
        return progressCache;
    }

    if (!userId) {
        return { watched: [], xp: 0, streak: 0, lastWatch: null, todayXp: 0 };
    }

    try {
        const response = await databases.listDocuments(DB_ID, PROGRESS_COL_ID, [
            Query.equal('userId', userId),
            Query.orderDesc('watchedAt'),
            Query.limit(500)
        ]);

        const watched = response.documents.map(doc => doc.videoId).filter(id => !id.endsWith('_started') && !id.startsWith('daily_login_'));
        const xp = response.documents.reduce((sum, doc) => sum + (doc.xpEarned || 100), 0);
        const lastWatch = response.documents.length > 0 ? response.documents[0].watchedAt : null;
        const todayXp = getTodayXp(response.documents);

        // Calculate streak from completions + daily logins (exclude _started records)
        const streakDocs = response.documents.filter(doc => !doc.videoId.endsWith('_started'));
        const streak = calculateStreak(streakDocs);

        progressCache = { watched, xp, streak, lastWatch, todayXp };
        cacheUserId = userId;

        return progressCache;
    } catch (error) {
        console.error('Error fetching progress:', error);
        return { watched: [], xp: 0, streak: 0, lastWatch: null, todayXp: 0 };
    }
};

// Calculate day streak from watch history
const calculateStreak = (documents) => {
    if (!documents || documents.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const lastWatched = new Date(documents[0].watchedAt);
    lastWatched.setHours(0, 0, 0, 0);

    if (lastWatched.getTime() < yesterday.getTime()) {
        return 0;
    }

    let streak = 1;
    let currentStreakDate = lastWatched;

    for (let i = 1; i < documents.length; i++) {
        const docDate = new Date(documents[i].watchedAt);
        docDate.setHours(0, 0, 0, 0);

        const timeDiff = currentStreakDate.getTime() - docDate.getTime();
        const diffDays = Math.round(timeDiff / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            continue;
        } else if (diffDays === 1) {
            streak++;
            currentStreakDate = docDate;
        } else {
            break;
        }
    }

    return streak;
};

// Mark a video as started/opened and award 10 XP
export const markVideoStarted = async (videoId, userId) => {
    if (!userId || !videoId) return { awarded: false, xp: 0 };

    try {
        const startedId = `${videoId}_started`;

        // Check if already awarded start XP for this video
        const existing = await databases.listDocuments(DB_ID, PROGRESS_COL_ID, [
            Query.equal('userId', userId),
            Query.equal('videoId', startedId),
            Query.limit(1)
        ]);

        if (existing.documents.length > 0) return { awarded: false, xp: 0 };

        await databases.createDocument(DB_ID, PROGRESS_COL_ID, ID.unique(), {
            userId,
            videoId: startedId,
            watchedAt: new Date().toISOString(),
            xpEarned: 10
        });

        // Invalidate cache
        progressCache = null;
        return { awarded: true, xp: 10 };
    } catch (error) {
        console.error('Error marking video started:', error);
        return { awarded: false, xp: 0 };
    }
};

// Claim daily login XP (5 XP, once per day)
export const claimDailyLoginXp = async (userId) => {
    if (!userId) return { awarded: false, xp: 0 };

    try {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const loginId = `daily_login_${today}`;

        // Check if already claimed today
        const existing = await databases.listDocuments(DB_ID, PROGRESS_COL_ID, [
            Query.equal('userId', userId),
            Query.equal('videoId', loginId),
            Query.limit(1)
        ]);

        if (existing.documents.length > 0) return { awarded: false, xp: 0 };

        await databases.createDocument(DB_ID, PROGRESS_COL_ID, ID.unique(), {
            userId,
            videoId: loginId,
            watchedAt: new Date().toISOString(),
            xpEarned: 5
        });

        // Invalidate cache
        progressCache = null;
        return { awarded: true, xp: 5 };
    } catch (error) {
        console.error('Error claiming daily login XP:', error);
        return { awarded: false, xp: 0 };
    }
};

// Mark a video as fully watched and award 100 XP
export const markVideoWatched = async (videoId, userId) => {
    if (!userId || !videoId) {
        return { progress: await getProgress(userId), xpAwarded: 0, streakBonus: 0, leveledUp: false };
    }

    try {
        // Check if already watched (completed)
        const existing = await databases.listDocuments(DB_ID, PROGRESS_COL_ID, [
            Query.equal('userId', userId),
            Query.equal('videoId', videoId),
            Query.limit(1)
        ]);

        if (existing.documents.length > 0) {
            const progress = await getProgress(userId);
            return { progress, xpAwarded: 0, streakBonus: 0, leveledUp: false };
        }

        // Calculate bonus XP for streak
        const currentProgress = await getProgress(userId);
        const oldLevel = calculateLevel(currentProgress.xp);
        const streakBonus = currentProgress.streak > 0 ? Math.min(currentProgress.streak * 10, 100) : 0;
        const xpEarned = 100 + streakBonus;

        // Create new watch record
        await databases.createDocument(DB_ID, PROGRESS_COL_ID, ID.unique(), {
            userId,
            videoId,
            watchedAt: new Date().toISOString(),
            xpEarned
        });

        // Invalidate cache
        progressCache = null;

        // Return updated progress with metadata
        const newProgress = await getProgress(userId);
        const newLevel = calculateLevel(newProgress.xp);

        return {
            progress: newProgress,
            xpAwarded: xpEarned,
            streakBonus,
            leveledUp: newLevel > oldLevel,
            newLevel
        };
    } catch (error) {
        console.error('Error marking video watched:', error);
        const progress = await getProgress(userId);
        return { progress, xpAwarded: 0, streakBonus: 0, leveledUp: false };
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
