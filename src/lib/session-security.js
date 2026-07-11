import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export const activateSingleDeviceSession = async (userId) => {
  const sessionId = crypto.randomUUID();
  localStorage.setItem("sessionId", sessionId);

  try {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, {
      activeSessionId: sessionId,
      activeSessionUpdatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.warn("Failed to set active session:", error);
  }
};
