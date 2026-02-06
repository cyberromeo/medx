import { account } from "@/lib/appwrite";

export const registerActiveSession = async (currentSessionId) => {
  if (!currentSessionId) {
    throw new Error("Missing current session ID.");
  }

  let currentPrefs = {};
  try {
    currentPrefs = (await account.getPrefs()) || {};
  } catch (error) {
    currentPrefs = {};
  }

  try {
    await account.updatePrefs({
      ...currentPrefs,
      activeSessionId: currentSessionId,
      activeSessionUpdatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.warn("Failed to update active session preferences:", error);
  }
};

export const enforceSingleDeviceSession = async (currentSessionId = null) => {
  const response = await account.listSessions();
  const sessions = response?.sessions || [];

  const activeSession =
    sessions.find((session) => session.$id === currentSessionId) ||
    sessions.find((session) => session.current);

  if (!activeSession) {
    console.warn("Could not find active session in list, skipping enforcement");
    return null; // Don't throw, just allow access
  }

  const staleSessions = sessions.filter((session) => session.$id !== activeSession.$id);



  await Promise.all(
    staleSessions.map(async (session) => {
      try {
        await account.deleteSession(session.$id);
      } catch (error) {
        // Log error but don't fail the entire login
        console.warn("Failed to deactivate stale session:", session.$id, error);
      }
    }),
  );

  return activeSession;
};

export const activateSingleDeviceSession = async (currentSessionId) => {
  await registerActiveSession(currentSessionId);
  return enforceSingleDeviceSession(currentSessionId);
};
