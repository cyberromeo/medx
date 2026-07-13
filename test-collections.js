const fs = require('fs');
const path = require('path');
const { Client, Databases } = require('node-appwrite');

const loadEnv = (filename) => {
    try {
        const envPath = path.resolve(__dirname, filename);
        if (fs.existsSync(envPath)) {
            const envConfig = fs.readFileSync(envPath, 'utf8').split('\n').reduce((acc, line) => {
                const parts = line.split('=');
                if (parts.length >= 2) {
                    const key = parts[0].trim();
                    const value = parts.slice(1).join('=').trim().replace(/^"|"$/g, '');
                    if (key && value) acc[key] = value;
                }
                return acc;
            }, {});
            process.env = { ...process.env, ...envConfig };
        }
    } catch(e) {}
};

loadEnv('.env.appwrite');

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const db = new Databases(client);

async function check() {
    try {
        const res = await db.listCollections(process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID);
        console.log("Collections:", res.collections.map(c => c.name + " (" + c.$id + ")"));
    } catch (e) {
        console.error(e);
    }
}
check();
