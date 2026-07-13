const fs = require('fs');
const path = require('path');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

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

loadEnv('.env.local');

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

async function check() {
    try {
        const snap = await firestore.collection('user_progress').limit(1).get();
        if (!snap.empty) {
            console.log("Progress doc:", snap.docs[0].data());
        } else {
            console.log("No progress docs found.");
        }
    } catch (e) {
        console.error(e);
    }
}
check();
