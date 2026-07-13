import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

let app;
let initError = null;
if (!getApps().length) {
  try {
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (privateKey) {
      privateKey = privateKey.replace(/^"|"$/g, "").replace(/\\n/g, "\n");
    }

    let projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (projectId) projectId = projectId.replace(/^"|"$/g, "");

    let clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    if (clientEmail) clientEmail = clientEmail.replace(/^"|"$/g, "");

    app = initializeApp({
      credential: cert({
        projectId: projectId,
        clientEmail: clientEmail,
        privateKey: privateKey,
      }),
    });
  } catch (error) {
    console.error("Firebase admin initialization error", error.stack);
    initError = error.message;
  }
} else {
  app = getApps()[0];
}

const adminAuth = app ? getAuth(app) : null;
const adminDb = app ? getFirestore(app) : null;

export { adminAuth, adminDb, app as admin, initError };
