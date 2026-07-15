const fs = require('fs');
const path = require('path');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

// Initialize Firebase Admin
initializeApp({
  credential: cert({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // Fix private key formatting issues
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
});

const db = getFirestore();

async function importVideos() {
  const filePath = path.join(__dirname, 'medx2026_videos.txt');
  const content = fs.readFileSync(filePath, 'utf-8');

  const lines = content.split('\n').map(l => l.trim()).filter(l => l !== '');

  let currentSubject = '';
  const videos = [];
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    
    // Check if line is a subject header
    if (line.startsWith('## ')) {
      // e.g. ## ANATOMY (1 videos)
      const match = line.match(/##\s+(.*?)\s+\(/);
      if (match) {
        currentSubject = match[1].trim();
        // Capitalize words appropriately if needed, or leave as is.
        // The subjects in the text are all caps or Title Case.
        // Let's just use the extracted subject name but formatted nicely.
        // E.g., "ANATOMY" -> "Anatomy", "OB GYNE" -> "OB GYNE", etc.
      } else {
        currentSubject = line.replace('##', '').trim();
      }
      i++;
      continue;
    }

    // Skip separator lines
    if (line.startsWith('===') || line.startsWith('MedX 2026') || line.startsWith('TOTAL:')) {
      i++;
      continue;
    }

    // If it's not a subject, it must be a video title followed by URL
    const title = line;
    const urlLine = lines[i + 1];
    
    if (urlLine && urlLine.startsWith('http')) {
      // Extract video ID
      // https://www.youtube.com/watch?v=pTivLuHLlcw
      let videoId = '';
      const urlParams = new URLSearchParams(urlLine.split('?')[1]);
      if (urlParams.has('v')) {
        videoId = urlParams.get('v');
      } else {
        // Fallback or youtu.be format
        const parts = urlLine.split('/');
        videoId = parts[parts.length - 1];
      }

      videos.push({
        title: title,
        description: title,
        videoId: videoId,
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        category: 'MIST_2026',
        subCategory: currentSubject,
        duration: "00:00",
        createdAt: FieldValue.serverTimestamp()
      });

      i += 2; // Skip title and URL
    } else {
      i++;
    }
  }

  console.log(`Found ${videos.length} videos to import.`);

  // Write to Firestore
  let count = 0;
  for (const video of videos) {
    try {
      await db.collection('videos').add(video);
      count++;
      console.log(`Imported: ${video.title} [${video.subCategory}]`);
    } catch (err) {
      console.error(`Error importing ${video.title}:`, err);
    }
  }

  console.log(`Successfully imported ${count} videos.`);
}

importVideos().then(() => process.exit(0)).catch(console.error);
