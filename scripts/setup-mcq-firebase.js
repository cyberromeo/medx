const fs = require('fs');
const path = require('path');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Load environment variables
const loadEnv = (filename) => {
    try {
        const envPath = path.resolve(__dirname, '..', filename);
        if (fs.existsSync(envPath)) {
            const envConfig = fs.readFileSync(envPath, 'utf8').split('\n').reduce((acc, line) => {
                const parts = line.split('=');
                if (parts.length >= 2) {
                    const key = parts[0].trim();
                    const value = parts.slice(1).join('=').trim().replace(/^"|"$/g, '');
                    if (key && value) acc[key] = value;
                }
                return acc;
            }, {});
            process.env = { ...process.env, ...envConfig };
        }
    } catch(e) {
        console.error(`Error loading ${filename}`, e.message);
    }
};

loadEnv('.env.local');

// Initialize Firebase Admin
let privateKey = process.env.FIREBASE_PRIVATE_KEY;
if (privateKey) {
    privateKey = privateKey.replace(/\\n/g, '\n');
}

const app = initializeApp({
    credential: cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
    }),
});
const firestore = getFirestore(app);

// Parser logic
function parseQuestions(mdContent) {
  const questions = [];
  const parts = mdContent.split(/^## Question \d+/gm);

  for (let i = 1; i < parts.length; i++) {
    const block = parts[i].trim();
    const q = { id: i };

    const optionsIdx = block.indexOf("### Options");
    if (optionsIdx === -1) continue;
    let questionText = block.substring(0, optionsIdx).trim();

    const imgMatch = questionText.match(/!\[.*?\]\((.*?)\)/);
    if (imgMatch) {
      q.image = imgMatch[1];
      questionText = questionText.replace(/!\[.*?\]\(.*?\)/, "").trim();
    }

    q.question = questionText;

    const optionsBlock = block.substring(optionsIdx);
    const optionLines = optionsBlock.match(/- (?:\*\*\[x\]\*\*|\[ \]) [A-D]\. .+/g);
    if (!optionLines || optionLines.length < 4) continue;

    q.options = [];
    q.correct = -1;

    optionLines.forEach((line, j) => {
      const isCorrect = line.includes("**[x]**");
      const optText = line.replace(/- (?:\*\*\[x\]\*\*|\[ \]) [A-D]\. /, "").trim();
      q.options.push(optText);
      if (isCorrect) q.correct = j;
    });

    const explMatch = block.match(/### Explanation\s*\n([\s\S]*?)(?=\n---|\n## |$)/);
    if (explMatch) {
      q.explanation = explMatch[1].trim();
    }

    if (q.correct === -1) {
      const correctMatch = block.match(/\*\*Correct Answer:\s*([A-D])\*\*/);
      if (correctMatch) {
        q.correct = correctMatch[1].charCodeAt(0) - 65; 
      }
    }

    if (q.correct === -1) {
      q.correct = 0; 
    }

    questions.push(q);
  }

  return questions;
}

async function uploadTest() {
  const mdPath = path.resolve(__dirname, "../extracted_questions.md");
  const mdContent = fs.readFileSync(mdPath, "utf-8");
  const questions = parseQuestions(mdContent);
  console.log(`Parsed ${questions.length} questions from extracted_questions.md`);

  const TEST_TITLE = "COMPLETE DERMA+ANES - 07-03-26 CHENNAI";
  const TEST_SLUG = "complete-derma-anes-07-03-26-chennai";
  const SUBCATEGORY = "mist-2026-topic-wise";

  // Check if test exists
  const testsRef = firestore.collection('mcq_tests');
  const snapshot = await testsRef.where('slug', '==', TEST_SLUG).get();
  
  let testId = '';
  
  if (!snapshot.empty) {
     console.log("Test already exists. Overwriting questions.");
     testId = snapshot.docs[0].id;
     
     // Delete old questions
     const qSnapshot = await firestore.collection('mcq_questions').where('testId', '==', testId).get();
     const batch = firestore.batch();
     qSnapshot.docs.forEach((doc) => {
         batch.delete(doc.ref);
     });
     await batch.commit();
     console.log(`Deleted ${qSnapshot.size} old questions.`);
  } else {
     const newDoc = testsRef.doc();
     testId = newDoc.id;
     await newDoc.set({
         title: TEST_TITLE,
         slug: TEST_SLUG,
         subcategory: SUBCATEGORY,
         description: "Complete Dermatology + Anesthesia MCQs - Chennai 07-03-26",
         icon: "🏥",
         questionCount: questions.length,
         createdAt: Date.now()
     });
     console.log(`Created test doc with ID: ${testId}`);
  }

  console.log(`Uploading ${questions.length} questions...`);
  
  // Batch writes for questions
  const batchArray = [];
  let currentBatch = firestore.batch();
  let operationCount = 0;

  for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const qRef = firestore.collection('mcq_questions').doc();
      currentBatch.set(qRef, {
          testId: testId,
          order: q.id,
          question: q.question.substring(0, 2048),
          optionA: q.options[0]?.substring(0, 512) || "",
          optionB: q.options[1]?.substring(0, 512) || "",
          optionC: q.options[2]?.substring(0, 512) || "",
          optionD: q.options[3]?.substring(0, 512) || "",
          correct: q.correct,
          explanation: (q.explanation || "").substring(0, 10000),
          image: q.image || ""
      });
      
      operationCount++;
      if (operationCount === 400) {
          batchArray.push(currentBatch);
          currentBatch = firestore.batch();
          operationCount = 0;
      }
  }

  if (operationCount > 0) {
      batchArray.push(currentBatch);
  }

  for (let i = 0; i < batchArray.length; i++) {
      await batchArray[i].commit();
      console.log(`Committed batch ${i + 1} of ${batchArray.length}`);
  }

  console.log("Done uploading questions to Firebase!");
}

uploadTest().catch(console.error);
