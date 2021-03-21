import { get, set } from "idb-keyval";

export async function getSavedSessions(): Promise<string[] | null> {
  const sessions: Array<string> | null = await get("savedSessions");

  if (sessions) {
    return sessions;
  } else {
    return null;
  }
}

export async function saveSession(session: string) {
  console.log('saving session', session);
    const sessions: Array<string> | null = await get("savedSessions");
    console.log("sessions", sessions);

    if (sessions) {
        const newSessions = [...sessions, session];
        await set("savedSessions", newSessions);
    }
    else {
        await set("savedSessions", [session]);
    }
}