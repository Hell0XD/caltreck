import type { AuthSession } from "./models";

const SESSION_KEY = "caltrek.session.v1";

export class SessionStorage {
  static read() {
    try {
      const raw = window.localStorage.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) as AuthSession) : null;
    } catch {
      return null;
    }
  }

  static write(session: AuthSession | null) {
    if (session) {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      window.localStorage.removeItem(SESSION_KEY);
    }
  }
}
