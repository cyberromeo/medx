import { account } from "@/lib/appwrite";

export const enforceSingleDeviceSession = async (currentSessionId = null) => {
  const response = await account.listSessions();
  const sessions = response?.sessions || [];

  const activeSession =
    sessions.find((session) => session.$id === currentSessionId) ||
    sessions.find((session) => session.current);

  if (!activeSession) {
    throw new Error("Unable to validate active session.");
  }

  const staleSessions = sessions.filter((session) => session.$id !== activeSession.$id);

  await Promise.all(
    staleSessions.map(async (session) => {
      try {
        await account.deleteSession(session.$id);
      } catch (error) {
        if (error?.code === 401 || error?.code === 404) {
          return;
        }
        throw error;
      }
    }),
  );

  return activeSession;
};
