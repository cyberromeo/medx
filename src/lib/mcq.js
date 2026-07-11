/**
 * MCQ Data Library — fetches from Firebase
 */
import { db } from "./firebase";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";

const TESTS_COL = "mcq_tests";
const QUESTIONS_COL = "mcq_questions";

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
 * Fetch all tests for a given subcategory slug from Firebase
 */
export async function getTestsBySubcategory(subcategorySlug) {
  try {
    const q = query(
      collection(db, TESTS_COL),
      where("subcategory", "==", subcategorySlug),
      orderBy("createdAt", "desc"),
      limit(100)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => {
      const doc = docSnap.data();
      return {
        id: docSnap.id,
        title: doc.title,
        slug: doc.slug,
        description: doc.description || "",
        icon: doc.icon || "📝",
        questionCount: doc.questionCount || 0,
      };
    });
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
    const q = query(
      collection(db, TESTS_COL),
      where("slug", "==", testSlug),
      limit(1)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    
    const docSnap = snapshot.docs[0];
    const doc = docSnap.data();
    return {
      id: docSnap.id,
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
 * Fetch all questions for a given test ID from Firebase
 */
export async function getQuestionsByTestId(testId) {
  try {
    const q = query(
      collection(db, QUESTIONS_COL),
      where("testId", "==", testId),
      orderBy("order", "asc")
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((docSnap) => {
      const doc = docSnap.data();
      return {
        id: doc.order,
        question: doc.question,
        options: [doc.optionA, doc.optionB, doc.optionC, doc.optionD],
        correct: doc.correct,
        explanation: doc.explanation || "",
        image: doc.image || null,
      };
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return [];
  }
}
