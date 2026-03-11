/**
 * Setup MCQ collections in Appwrite and upload questions
 * Run with: node scripts/setup-mcq-db.mjs
 */
import { Client, Databases, ID, Permission, Role } from "node-appwrite";
import * as dotenv from "dotenv";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, "../.env.local") });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const TESTS_COL = "mcq_tests";
const QUESTIONS_COL = "mcq_questions";

// ─── Parse extracted_questions.md ───────────────────────
function parseQuestions(mdContent) {
  const questions = [];
  // Split by "## Question N"
  const parts = mdContent.split(/^## Question \d+/gm);

  for (let i = 1; i < parts.length; i++) {
    const block = parts[i].trim();
    const q = { id: i };

    // Extract question text (everything before ### Options)
    const optionsIdx = block.indexOf("### Options");
    if (optionsIdx === -1) continue;
    let questionText = block.substring(0, optionsIdx).trim();

    // Extract image if present
    const imgMatch = questionText.match(/!\[.*?\]\((.*?)\)/);
    if (imgMatch) {
      q.image = imgMatch[1];
      questionText = questionText.replace(/!\[.*?\]\(.*?\)/, "").trim();
    }

    q.question = questionText;

    // Extract options
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

    // Extract explanation
    const explMatch = block.match(/### Explanation\s*\n([\s\S]*?)(?=\n---|\n## |$)/);
    if (explMatch) {
      q.explanation = explMatch[1].trim();
    }

    // If correct answer not found from checkbox, try from "Correct Answer: X"
    if (q.correct === -1) {
      const correctMatch = block.match(/\*\*Correct Answer:\s*([A-D])\*\*/);
      if (correctMatch) {
        q.correct = correctMatch[1].charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
      }
    }

    // If still -1, check for N/A (no correct answer marked)
    if (q.correct === -1) {
      q.correct = 0; // default to first option if none marked
    }

    questions.push(q);
  }

  return questions;
}

// ─── Create Collections ─────────────────────────────────
async function createCollections() {
  console.log("Creating mcq_tests collection...");
  try {
    await databases.createCollection(DB_ID, TESTS_COL, "MCQ Tests", [
      Permission.read(Role.users()),
    ]);
    console.log("  ✅ mcq_tests created");
  } catch (e) {
    if (e.code === 409) {
      console.log("  ⚠️  mcq_tests already exists, skipping");
    } else throw e;
  }

  // Create attributes for mcq_tests
  const testAttrs = [
    { type: "string", key: "title", size: 256, required: true },
    { type: "string", key: "slug", size: 128, required: true },
    { type: "string", key: "subcategory", size: 128, required: true },
    { type: "string", key: "description", size: 512, required: false },
    { type: "string", key: "icon", size: 16, required: false },
    { type: "integer", key: "questionCount", required: false },
  ];

  for (const attr of testAttrs) {
    try {
      if (attr.type === "string") {
        await databases.createStringAttribute(
          DB_ID, TESTS_COL, attr.key, attr.size, attr.required, undefined, false
        );
      } else if (attr.type === "integer") {
        await databases.createIntegerAttribute(
          DB_ID, TESTS_COL, attr.key, attr.required
        );
      }
      console.log(`  ✅ attr: ${attr.key}`);
    } catch (e) {
      if (e.code === 409) console.log(`  ⚠️  attr ${attr.key} exists`);
      else throw e;
    }
  }

  console.log("\nCreating mcq_questions collection...");
  try {
    await databases.createCollection(DB_ID, QUESTIONS_COL, "MCQ Questions", [
      Permission.read(Role.users()),
    ]);
    console.log("  ✅ mcq_questions created");
  } catch (e) {
    if (e.code === 409) {
      console.log("  ⚠️  mcq_questions already exists, skipping");
    } else throw e;
  }

  // Create attributes for mcq_questions
  const qAttrs = [
    { type: "string", key: "testId", size: 64, required: true },
    { type: "integer", key: "order", required: true },
    { type: "string", key: "question", size: 2048, required: true },
    { type: "string", key: "optionA", size: 512, required: true },
    { type: "string", key: "optionB", size: 512, required: true },
    { type: "string", key: "optionC", size: 512, required: true },
    { type: "string", key: "optionD", size: 512, required: true },
    { type: "integer", key: "correct", required: true },
    { type: "string", key: "explanation", size: 10000, required: false },
    { type: "string", key: "image", size: 512, required: false },
  ];

  for (const attr of qAttrs) {
    try {
      if (attr.type === "string") {
        await databases.createStringAttribute(
          DB_ID, QUESTIONS_COL, attr.key, attr.size, attr.required, undefined, false
        );
      } else if (attr.type === "integer") {
        await databases.createIntegerAttribute(
          DB_ID, QUESTIONS_COL, attr.key, attr.required
        );
      }
      console.log(`  ✅ attr: ${attr.key}`);
    } catch (e) {
      if (e.code === 409) console.log(`  ⚠️  attr ${attr.key} exists`);
      else throw e;
    }
  }

  // Wait for attributes to be ready
  console.log("\n⏳ Waiting 5s for attributes to be available...");
  await new Promise((r) => setTimeout(r, 5000));

  // Create indexes
  try {
    await databases.createIndex(DB_ID, TESTS_COL, "slug_idx", "key", ["slug"], ["asc"]);
    console.log("  ✅ index: slug_idx on mcq_tests");
  } catch (e) {
    if (e.code === 409) console.log("  ⚠️  index slug_idx exists");
    else console.log("  ⚠️  index err:", e.message);
  }

  try {
    await databases.createIndex(DB_ID, QUESTIONS_COL, "testId_idx", "key", ["testId", "order"], ["asc", "asc"]);
    console.log("  ✅ index: testId_idx on mcq_questions");
  } catch (e) {
    if (e.code === 409) console.log("  ⚠️  index testId_idx exists");
    else console.log("  ⚠️  index err:", e.message);
  }
}

// ─── Upload Questions ───────────────────────────────────
async function uploadTest(questions) {
  const TEST_TITLE = "COMPLETE DERMA+ANES - 07-03-26 CHENNAI";
  const TEST_SLUG = "complete-derma-anes-07-03-26-chennai";
  const SUBCATEGORY = "mist-2026-topic-wise";

  console.log(`\nCreating test: ${TEST_TITLE}`);

  // Check if test already exists
  try {
    const existing = await databases.listDocuments(DB_ID, TESTS_COL, []);
    const existingTest = existing.documents.find((d) => d.slug === TEST_SLUG);
    if (existingTest) {
      console.log("  ⚠️  Test already exists, deleting old data...");
      // Delete old questions
      let offset = 0;
      while (true) {
        const oldQs = await databases.listDocuments(DB_ID, QUESTIONS_COL, [
          // Can't query yet if index isn't ready, list all
        ]);
        const toDelete = oldQs.documents.filter((d) => d.testId === existingTest.$id);
        if (toDelete.length === 0) break;
        for (const d of toDelete) {
          await databases.deleteDocument(DB_ID, QUESTIONS_COL, d.$id);
        }
        offset += toDelete.length;
      }
      await databases.deleteDocument(DB_ID, TESTS_COL, existingTest.$id);
      console.log("  ✅ Old test data cleaned");
    }
  } catch (e) {
    // Collection might be empty
  }

  // Create the test document
  const testDoc = await databases.createDocument(DB_ID, TESTS_COL, ID.unique(), {
    title: TEST_TITLE,
    slug: TEST_SLUG,
    subcategory: SUBCATEGORY,
    description: "Complete Dermatology + Anesthesia MCQs - Chennai 07-03-26",
    icon: "🏥",
    questionCount: questions.length,
  });

  console.log(`  ✅ Test created with ID: ${testDoc.$id}`);
  console.log(`  📝 Uploading ${questions.length} questions...`);

  let uploaded = 0;
  for (const q of questions) {
    try {
      await databases.createDocument(DB_ID, QUESTIONS_COL, ID.unique(), {
        testId: testDoc.$id,
        order: q.id,
        question: q.question.substring(0, 2048),
        optionA: q.options[0]?.substring(0, 512) || "",
        optionB: q.options[1]?.substring(0, 512) || "",
        optionC: q.options[2]?.substring(0, 512) || "",
        optionD: q.options[3]?.substring(0, 512) || "",
        correct: q.correct,
        explanation: (q.explanation || "").substring(0, 10000),
        image: q.image || "",
      });
      uploaded++;
      if (uploaded % 10 === 0) {
        console.log(`     ${uploaded}/${questions.length} uploaded...`);
      }
    } catch (e) {
      console.error(`  ❌ Q${q.id} failed:`, e.message);
    }
  }

  console.log(`  ✅ Done! ${uploaded}/${questions.length} questions uploaded.`);
}

// ─── Main ───────────────────────────────────────────────
async function main() {
  console.log("🚀 MCQ Database Setup\n");
  console.log(`   Endpoint: ${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}`);
  console.log(`   Project:  ${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`);
  console.log(`   Database: ${DB_ID}\n`);

  // Parse questions from markdown
  const mdPath = resolve(__dirname, "../extracted_questions.md");
  const mdContent = readFileSync(mdPath, "utf-8");
  const questions = parseQuestions(mdContent);
  console.log(`📖 Parsed ${questions.length} questions from extracted_questions.md\n`);

  // Create collections & attributes
  await createCollections();

  // Upload test + questions
  await uploadTest(questions);

  console.log("\n✅ All done! Add these to your .env.local:");
  console.log(`NEXT_PUBLIC_APPWRITE_MCQ_TESTS_COLLECTION_ID=${TESTS_COL}`);
  console.log(`NEXT_PUBLIC_APPWRITE_MCQ_QUESTIONS_COLLECTION_ID=${QUESTIONS_COL}`);
}

main().catch(console.error);
