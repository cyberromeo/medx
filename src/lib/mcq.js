/**
 * MCQ Data Library — fetches from Appwrite
 */
import { databases } from "./appwrite";
import { Query } from "appwrite";

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const TESTS_COL = process.env.NEXT_PUBLIC_APPWRITE_MCQ_TESTS_COLLECTION_ID;
const QUESTIONS_COL = process.env.NEXT_PUBLIC_APPWRITE_MCQ_QUESTIONS_COLLECTION_ID;

// Available MCQ subcategories (static list, tests are fetched from DB)
export const MCQ_SUBCATEGORIES = [
  {
    slug: "mist-2026-topic-wise",
    title: "MIST 2026 TOPIC-WISE",
    description: "Topic-wise MCQs for MIST 2026 preparation",
    icon: "🎯",
  },
];

export function getSubcategoryBySlug(slug) {
  return MCQ_SUBCATEGORIES.find((s) => s.slug === slug) || null;
}

/**
 * Fetch all tests for a given subcategory slug from Appwrite
 */
export async function getTestsBySubcategory(subcategorySlug) {
  try {
    const response = await databases.listDocuments(DB_ID, TESTS_COL, [
      Query.equal("subcategory", subcategorySlug),
      Query.orderDesc("$createdAt"),
      Query.limit(100),
    ]);
    return response.documents.map((doc) => ({
      id: doc.$id,
      title: doc.title,
      slug: doc.slug,
      description: doc.description || "",
      icon: doc.icon || "📝",
      questionCount: doc.questionCount || 0,
    }));
  } catch (error) {
    console.error("Error fetching tests:", error);
    return [];
  }
}

/**
 * Fetch a single test by its slug
 */
export async function getTestBySlug(testSlug) {
  try {
    const response = await databases.listDocuments(DB_ID, TESTS_COL, [
      Query.equal("slug", testSlug),
      Query.limit(1),
    ]);
    if (response.documents.length === 0) return null;
    const doc = response.documents[0];
    return {
      id: doc.$id,
      title: doc.title,
      slug: doc.slug,
      subcategory: doc.subcategory,
      description: doc.description || "",
      icon: doc.icon || "📝",
      questionCount: doc.questionCount || 0,
    };
  } catch (error) {
    console.error("Error fetching test:", error);
    return null;
  }
}

/**
 * Fetch all questions for a given test ID from Appwrite
 */
export async function getQuestionsByTestId(testId) {
  try {
    const allQuestions = [];
    let offset = 0;
    const batchSize = 100;

    while (true) {
      const response = await databases.listDocuments(DB_ID, QUESTIONS_COL, [
        Query.equal("testId", testId),
        Query.orderAsc("order"),
        Query.limit(batchSize),
        Query.offset(offset),
      ]);

      const mapped = response.documents.map((doc) => ({
        id: doc.order,
        question: doc.question,
        options: [doc.optionA, doc.optionB, doc.optionC, doc.optionD],
        correct: doc.correct,
        explanation: doc.explanation || "",
        image: doc.image || null,
      }));

      allQuestions.push(...mapped);

      if (response.documents.length < batchSize) break;
      offset += batchSize;
    }

    return allQuestions;
  } catch (error) {
    console.error("Error fetching questions:", error);
    return [];
  }
}
