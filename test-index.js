const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

let privateKey = "undefined";
try {
    const fs = require('fs');
    const env = fs.readFileSync('.env.local', 'utf8');
    const match = env.match(/FIREBASE_PRIVATE_KEY="(.+?)"/s);
    if (match) privateKey = match[1].replace(/\\n/g, '\n');
} catch(e) {}

const app = initializeApp({
    credential: cert({
        projectId: "medx-e9acd",
        clientEmail: "firebase-adminsdk-fbsvc@medx-e9acd.iam.gserviceaccount.com",
        privateKey: privateKey,
    })
});

const db = getFirestore(app);

async function testQuery() {
    try {
        const snapshot = await db.collection("user_progress")
            .where("userId", "==", "697f48b40005f0c236b4")
            .orderBy("watchedAt", "desc")
            .limit(5)
            .get();
        console.log("Success! Found", snapshot.docs.length);
    } catch (e) {
        console.error("Index Error:", e.message);
    }
}
testQuery();
