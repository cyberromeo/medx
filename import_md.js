const fs = require('fs');
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

function getSubjectOverride(title, currentSubject) {
  const t = title.toLowerCase();
  if (t.includes('orthopaedic')) return 'ORTHOPAEDIC';
  if (t.includes('dermatology')) return 'DERMATOLOGY';
  if (t.includes('pharmacology')) return 'PHARMACOLOGY';
  if (t.includes('microbiology')) return 'MICROBIOLOGY';
  if (t.includes('medicine by dr.singaram')) return 'MEDICINE BY DR.SINGARAM';
  if (t.includes('psm')) return 'PSM';
  if (t.includes('paediatrics')) return 'PAEDIATRICS';
  if (t.includes('surgical') || t.includes('surgery') || t.includes('oncosurgery')) return 'SURGERY';
  
  return currentSubject;
}

async function importVideos() {
  console.log("Deleting old MIST_2026 videos...");
  const oldVideos = await db.collection('videos').where('category', '==', 'MIST_2026').get();
  const deleteBatch = db.batch();
  oldVideos.forEach(doc => {
    deleteBatch.delete(doc.ref);
  });
  await deleteBatch.commit();
  console.log(`Deleted ${oldVideos.size} old videos.`);

  const content = fs.readFileSync(path.resolve(__dirname, 'medx2026_videos.md'), 'utf-8');
  const lines = content.split('\n');

  let currentSubject = '';
  let currentTitle = '';
  const batch = db.batch();
  let count = 0;
  
  const subjectsSet = new Set();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const subjectMatch = line.match(/^##\s+(.*?)\s+\(\d+\s+videos\)/i);
    if (subjectMatch) {
      currentSubject = subjectMatch[1].trim().toUpperCase();
      continue;
    }

    if (line.startsWith('- ')) {
      currentTitle = line.substring(2).trim();
      continue;
    }

    if (line.startsWith('https://www.youtube.com/watch?v=')) {
      const videoUrl = line;
      const videoId = videoUrl.split('v=')[1].split('&')[0];
      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      
      const actualSubject = getSubjectOverride(currentTitle, currentSubject);
      subjectsSet.add(actualSubject);

      const docRef = db.collection('videos').doc();
      batch.set(docRef, {
        id: videoId,
        title: currentTitle,
        category: 'MIST_2026',
        subCategory: actualSubject,
        videoUrl: videoUrl,
        thumbnailUrl: thumbnailUrl,
        createdAt: new Date()
      });
      console.log(`Prepared: [${actualSubject}] ${currentTitle}`);
      count++;
    }
  }

  if (count > 0) {
    await batch.commit();
    console.log(`Successfully imported ${count} videos.`);
    console.log(`Detected subjects: ${Array.from(subjectsSet).join(', ')}`);
  } else {
    console.log("No videos found to import.");
  }
}

importVideos().then(() => process.exit(0)).catch(console.error);
