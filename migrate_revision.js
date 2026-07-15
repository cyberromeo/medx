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

async function migrate() {
  const snapshot = await db.collection('videos').where('category', '==', 'MIST_2026').get();
  const batch = db.batch();
  let count = 0;

  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.subCategory === 'ANATOMY REVISION') {
      batch.update(doc.ref, { category: 'MIST_2026_REVISION' });
      count++;
      console.log(`Migrating: ${data.title}`);
    }
  });

  if (count > 0) {
    await batch.commit();
    console.log(`Migrated ${count} videos to MIST_2026_REVISION`);
  } else {
    console.log("No revision videos found to migrate.");
  }
}

migrate().then(() => process.exit(0)).catch(console.error);
