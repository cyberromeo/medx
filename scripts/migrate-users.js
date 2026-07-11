const fs = require('fs');
const path = require('path');
const { Client, Users } = require('node-appwrite');
const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

const loadEnv = (filename) => {
    try {
        const envPath = path.resolve(__dirname, '..', filename);
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
    } catch(e) {
        console.error(`Error loading ${filename}`, e.message);
    }
};

loadEnv('.env.local');
loadEnv('.env.appwrite');

const appwriteClient = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const appwriteUsers = new Users(appwriteClient);

let privateKey = process.env.FIREBASE_PRIVATE_KEY;
if (privateKey) {
    privateKey = privateKey.replace(/\\n/g, '\n');
}

const app = initializeApp({
    credential: cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
    }),
});
const auth = getAuth(app);

async function migrateUsers() {
    console.log("Fetching users from Appwrite...");
    let allUsers = [];
    
    // Fetch all users (handling pagination if needed, though for a small project list() might return all up to the limit)
    // Actually list() returns up to 25 by default. Let's use limits and offsets or just list() if small.
    // Let's use search/limit if possible. node-appwrite Users.list() allows queries.
    const { Query } = require('node-appwrite');
    let offset = 0;
    const limit = 100;

    while (true) {
        const response = await appwriteUsers.list([
            Query.limit(limit),
            Query.offset(offset)
        ]);
        allUsers = allUsers.concat(response.users);
        if (response.users.length < limit) {
            break;
        }
        offset += limit;
    }

    console.log(`Found ${allUsers.length} users to migrate.`);
    if (allUsers.length === 0) {
        return;
    }

    const firebaseUsersToImport = allUsers.map(user => {
        return {
            uid: user.$id,
            email: user.email,
            emailVerified: user.emailVerification || false,
            displayName: user.name || "Unknown User",
            // We cannot import passwords due to Argon2 mismatch in Node Admin SDK.
            metadata: {
                creationTime: new Date(user.$createdAt).toISOString(),
                lastSignInTime: user.accessedAt ? new Date(user.accessedAt).toISOString() : undefined
            }
        };
    });

    console.log("Importing to Firebase Auth...");
    
    // Firebase auth.importUsers supports up to 1000 users at once
    try {
        const result = await auth.importUsers(firebaseUsersToImport, {
            hash: { algorithm: 'STANDARD_SCRYPT' } // Just a dummy hash config since we are not importing passwords
        });
        
        console.log(`Successfully imported ${result.successCount} users.`);
        if (result.failureCount > 0) {
            console.warn(`Failed to import ${result.failureCount} users.`);
            result.errors.forEach((err) => {
                console.error(`Error for user index ${err.index}: ${err.error.message}`);
            });
        }
    } catch (e) {
        console.error("Error importing users to Firebase:", e);
    }
}

migrateUsers();
