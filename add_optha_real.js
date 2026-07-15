const path = require('path');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

initializeApp({
  credential: cert({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
});

const db = getFirestore();

async function addVideo() {
  const videoId = "IL356oTe5BM";
  const video = {
    videoId: videoId,
    title: "Ophthalmology Revision Video",
    category: "MIST_2026_REVISION",
    subCategory: "OPHTHALMOLOGY REVISION",
    videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    duration: "00:00",
    createdAt: new Date()
  };

  const docRef = db.collection('videos').doc();
  await docRef.set(video);
  console.log("Added OPTHA REVISION video.");
}

addVideo().then(() => process.exit(0));
