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

async function fix() {
  const q = await db.collection('videos').where('category', '==', 'MIST_2026').where('subCategory', '==', 'PSM').get();
  
  const batch = db.batch();
  let count = 0;
  
  q.forEach(doc => {
    const data = doc.data();
    const title = data.title;
    
    let newSub = null;
    
    if (title.includes('Paediatrics')) {
      newSub = 'PAEDIATRICS';
    } else if (title.includes('Surgical') || title.includes('SURGERY') || title.includes('Surgery') || title.includes('Oncosurgery')) {
      newSub = 'SURGERY';
    }
    
    if (newSub) {
      batch.update(doc.ref, { subCategory: newSub });
      console.log(`Updating ${title} to ${newSub}`);
      count++;
    }
  });
  
  await batch.commit();
  console.log(`Fixed ${count} videos.`);
}
fix().then(() => process.exit(0)).catch(console.error);
