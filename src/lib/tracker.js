import { db } from "./firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

const TRACKER_COL = "user_tracker";

export const SUBJECTS_LIST = [
  "Anatomy", "Physiology", "Biochemistry", "Pathology",
  "Microbiology", "Pharmacology", "Forensic medicine",
  "Community Medicine (PSM)", "General Medicine", "General Surgery",
  "Obstetrics & Gynecology (OBG)", "Pediatrics", "Ophthalmology",
  "Otorhinolaryngology (ENT)", "Orthopedics", "Anesthesiology",
  "Dermatology & Venereology", "Psychiatry", "Radiodiagnosis (Radiology)"
];

const INITIAL_STATE = {
  subjects: {},
  gts: {
    GT1: false, GT2: false, GT3: false, GT4: false, GT5: false, GT6: false, GT7: false
  }
};

// Initialize default subjects object
SUBJECTS_LIST.forEach(sub => {
  INITIAL_STATE.subjects[sub] = {
    Videos: false,
    R1: false,
    R2: false,
    PYQs: false,
    RevisionVideos: false,
    Qbank: false
  };
});

export const getTrackerData = async (userId) => {
  if (!userId) return INITIAL_STATE;
  try {
    const docRef = doc(db, TRACKER_COL, userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      // Ensure all subjects and GTs exist in case we added new ones later
      return {
        subjects: { ...INITIAL_STATE.subjects, ...(data.subjects || {}) },
        gts: { ...INITIAL_STATE.gts, ...(data.gts || {}) }
      };
    } else {
      // Document doesn't exist, create it
      await setDoc(docRef, INITIAL_STATE);
      return INITIAL_STATE;
    }
  } catch (error) {
    console.error("Error fetching tracker data:", error);
    return INITIAL_STATE;
  }
};

export const updateSubjectTracker = async (userId, subject, field, value) => {
  if (!userId) return;
  try {
    const docRef = doc(db, TRACKER_COL, userId);
    await updateDoc(docRef, {
      [`subjects.${subject}.${field}`]: value
    });
  } catch (error) {
    console.error("Error updating subject tracker:", error);
  }
};

export const updateGTTracker = async (userId, gt, value) => {
  if (!userId) return;
  try {
    const docRef = doc(db, TRACKER_COL, userId);
    await updateDoc(docRef, {
      [`gts.${gt}`]: value
    });
  } catch (error) {
    console.error("Error updating GT tracker:", error);
  }
};
