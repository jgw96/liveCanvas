import { get, set } from "idb-keyval";

export async function deleteSession(sessionString: string) {
  const sessions: Array<string> | null = await get("savedSessions");

  if (sessions) {
    const filtered = sessions.filter((session: any) => {
      console.log(session);
      return session.session !== sessionString;
    })

    if (filtered) {
      await set("savedSessions", filtered);
    }

    return filtered;
  }
  else {
    return null;
  }
}

export async function getSavedSessions(): Promise<any[] | null> {
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

    const newSession = {
      session,
      date: new Date(Date.now()).toLocaleDateString()
    }

    if (sessions) {
        const newSessions = [...sessions, newSession];
        await set("savedSessions", newSessions);
    }
    else {
        await set("savedSessions", [newSession]);
    }
}