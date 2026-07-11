import admin from "firebase-admin";

if (!admin.apps.length) {
  try {
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (privateKey) {
      privateKey = privateKey.replace(/\\n/g, '\n');
    }
    
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });
  } catch (error) {
    console.error("Firebase admin initialization error", error.stack);
  }
}

const adminAuth = admin.auth();
const adminDb = admin.firestore();

export { adminAuth, adminDb, admin };
