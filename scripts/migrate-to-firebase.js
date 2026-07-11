const fs = require('fs');
const path = require('path');
const { Client, Databases, Query } = require('node-appwrite');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Load environment variables
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

// Initialize Appwrite
const appwriteClient = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const appwriteDb = new Databases(appwriteClient);

// Initialize Firebase Admin
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
const firestore = getFirestore(app);

// Helpers
const fetchAppwriteDocs = async (dbId, colId) => {
    let allDocs = [];
    let offset = 0;
    const limit = 100;
    
    while (true) {
        const response = await appwriteDb.listDocuments(dbId, colId, [
            Query.limit(limit),
            Query.offset(offset)
        ]);
        
        allDocs = allDocs.concat(response.documents);
        
        if (response.documents.length < limit) break;
        offset += limit;
    }
    return allDocs;
};

// Main migration logic
async function migrateData() {
    const APP_DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
    
    const collectionsToMigrate = [
        { 
            appwriteColId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID, 
            firebaseColId: 'videos' 
        },
        { 
            appwriteColId: process.env.NEXT_PUBLIC_APPWRITE_CHAT_COLLECTION_ID, 
            firebaseColId: 'chat_messages' 
        },
        { 
            appwriteColId: process.env.NEXT_PUBLIC_APPWRITE_PROGRESS_COLLECTION_ID, 
            firebaseColId: 'user_progress' 
        },
        { 
            appwriteColId: process.env.NEXT_PUBLIC_APPWRITE_MCQ_TESTS_COLLECTION_ID, 
            firebaseColId: 'mcq_tests' 
        },
        { 
            appwriteColId: process.env.NEXT_PUBLIC_APPWRITE_MCQ_QUESTIONS_COLLECTION_ID, 
            firebaseColId: 'mcq_questions' 
        }
    ];

    console.log("Starting Migration...");

    for (const col of collectionsToMigrate) {
        if (!col.appwriteColId) {
            console.warn(`Skipping ${col.firebaseColId}: No Appwrite Collection ID found.`);
            continue;
        }

        console.log(`\nMigrating collection: ${col.firebaseColId} (Appwrite ID: ${col.appwriteColId})`);
        try {
            const docs = await fetchAppwriteDocs(APP_DB_ID, col.appwriteColId);
            console.log(`Found ${docs.length} documents.`);

            let successCount = 0;
            let errorCount = 0;

            for (const doc of docs) {
                try {
                    // Remove Appwrite specific metadata
                    const { $id, $createdAt, $updatedAt, $permissions, $databaseId, $collectionId, ...cleanData } = doc;
                    
                    // Maintain created timestamp in a uniform format
                    if ($createdAt) {
                        cleanData.createdAt = new Date($createdAt).getTime(); 
                    }
                    if ($updatedAt) {
                        cleanData.updatedAt = new Date($updatedAt).getTime(); 
                    }

                    // For user_progress and chat_messages, make sure dates are converted if they exist in schema natively
                    if (cleanData.watchedAt && typeof cleanData.watchedAt === 'string') {
                        cleanData.watchedAt = new Date(cleanData.watchedAt).getTime();
                    }

                    // Write to Firestore with the SAME ID to prevent duplicates if run twice
                    await firestore.collection(col.firebaseColId).doc($id).set(cleanData);
                    successCount++;
                } catch (e) {
                    console.error(`Error writing document ${doc.$id}:`, e.message);
                    errorCount++;
                }
            }

            console.log(`Finished ${col.firebaseColId}: ${successCount} successful, ${errorCount} errors.`);
        } catch(e) {
            console.error(`Failed to fetch from Appwrite collection ${col.appwriteColId}:`, e.message);
        }
    }

    console.log("\nMigration Complete!");
}

migrateData().catch(console.error);
