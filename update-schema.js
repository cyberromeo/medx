const fs = require('fs');
const path = require('path');
const { Client, Databases } = require('node-appwrite');

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

async function updateSchema() {
    console.log(`Updating Schema for Collection: ${COL_ID}...`);
    try {
        await databases.createStringAttribute(DB_ID, COL_ID, 'subCategory', 64, false, 'General');
        console.log("✅ Added 'subCategory' attribute.");
    } catch (error) {
        console.log("ℹ️ Attribute might already exist:", error.message);
    }
}

updateSchema();
