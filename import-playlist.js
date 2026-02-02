const fs = require('fs');
const path = require('path');
const { Client, Databases, ID } = require('node-appwrite');
const YouTube = require('youtube-sr').default;

// Manually parse .env.local
const envPath = path.resolve(__dirname, '.env.local');
const envConfig = fs.readFileSync(envPath, 'utf8').split('\n').reduce((acc, line) => {
    const [key, value] = line.split('=');
    if (key && value) acc[key.trim()] = value.trim();
    return acc;
}, {});
process.env = { ...process.env, ...envConfig };

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const COL_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID;
const PLAYLIST_ID = "PLU7bbysyz36C6eyHxZX7xrj3OoXWlMmKw";

async function importPlaylist() {
    console.log(`fetching playlist: ${PLAYLIST_ID}...`);
    try {
        const playlist = await YouTube.getPlaylist(PLAYLIST_ID, { limit: 50 });
        console.log(`Found ${playlist.videos.length} videos.`);

        for (const video of playlist.videos) {
            console.log(`Importing: ${video.title}`);
            try {
                await databases.createDocument(DB_ID, COL_ID, ID.unique(), {
                    title: video.title,
                    description: video.title,
                    videoId: video.id,
                    thumbnailUrl: video.thumbnail?.url || `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`,
                    category: "MIST",
                    subCategory: "Radiodiagnosis (Radiology)",
                    duration: video.durationFormatted || "00:00"
                });
                console.log(`  -> Success!`);
            } catch (err) {
                console.log(`  -> Error: ${err.message}`);
            }
        }
        console.log("Import Complete!");
    } catch (error) {
        console.error("Failed to fetch playlist:", error);
    }
}

importPlaylist();
