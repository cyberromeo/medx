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

async function updateVideos() {
  const batch = db.batch();
  
  const v1 = await db.collection('videos').where('videoId', '==', 'tBFBbYw4Bac').get();
  v1.forEach(doc => {
    batch.update(doc.ref, {
      title: 'Radiology Online Revision Session-1',
      subCategory: 'RADIOLOGY REVISION'
    });
  });

  const v2 = await db.collection('videos').where('videoId', '==', 'KGwIrOptvFA').get();
  v2.forEach(doc => {
    batch.update(doc.ref, {
      title: 'ENT Online Revision Class-1',
      subCategory: 'ENT REVISION'
    });
  });

  await batch.commit();
  console.log("Updated video subjects to Radiology and ENT.");
}

updateVideos().then(() => process.exit(0));
