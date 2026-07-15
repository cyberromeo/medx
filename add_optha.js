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

async function addVideos() {
  const videos = [
    {
      videoId: "tBFBbYw4Bac",
      title: "Ophthalmology Revision — Class 1",
      category: "MIST_2026_REVISION",
      subCategory: "OPHTHALMOLOGY REVISION",
      videoUrl: "https://www.youtube.com/watch?v=tBFBbYw4Bac",
      thumbnailUrl: "https://img.youtube.com/vi/tBFBbYw4Bac/hqdefault.jpg",
      duration: "00:00",
      createdAt: new Date()
    },
    {
      videoId: "KGwIrOptvFA",
      title: "Ophthalmology Revision — Class 2",
      category: "MIST_2026_REVISION",
      subCategory: "OPHTHALMOLOGY REVISION",
      videoUrl: "https://www.youtube.com/watch?v=KGwIrOptvFA",
      thumbnailUrl: "https://img.youtube.com/vi/KGwIrOptvFA/hqdefault.jpg",
      duration: "00:00",
      createdAt: new Date()
    }
  ];

  const batch = db.batch();
  for (const video of videos) {
    const docRef = db.collection('videos').doc();
    batch.set(docRef, video);
  }

  await batch.commit();
  console.log("Added 2 OPHTHALMOLOGY REVISION videos.");
}

addVideos().then(() => process.exit(0));
