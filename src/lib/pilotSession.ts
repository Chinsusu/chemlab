const PILOT_SESSION_KEY = "chemlab.pilotSession.v1";

export interface PilotSession {
  id: string;
  studentCode: string;
  grade: number;
  createdAt: string;
}

export interface PilotSessionStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function loadPilotSession(storage: PilotSessionStorage = window.localStorage): PilotSession | null {
  try {
    const raw = storage.getItem(PILOT_SESSION_KEY);
    if (!raw) return null;
    return parsePilotSession(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function resolvePilotSessionFromUrl(
  url: string,
  storage: PilotSessionStorage = window.localStorage
): PilotSession | null {
  const current = loadPilotSession(storage);
  const parsedUrl = new URL(url, "https://chemlab.local");
  const studentCode = sanitizeStudentCode(parsedUrl.searchParams.get("pilot"));
  const grade = sanitizeGrade(parsedUrl.searchParams.get("grade"));

  if (!studentCode || !grade) return current;

  const shouldReuseSession = current?.studentCode === studentCode && current.grade === grade;
  const next: PilotSession = {
    id: shouldReuseSession ? current.id : createSessionId(),
    studentCode,
    grade,
    createdAt: shouldReuseSession ? current.createdAt : new Date().toISOString()
  };
  storage.setItem(PILOT_SESSION_KEY, JSON.stringify(next));
  return next;
}

function parsePilotSession(value: unknown): PilotSession | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<PilotSession>;
  if (
    typeof candidate.id !== "string" ||
    typeof candidate.studentCode !== "string" ||
    typeof candidate.createdAt !== "string" ||
    typeof candidate.grade !== "number"
  ) {
    return null;
  }
  if (!sanitizeStudentCode(candidate.studentCode) || !Number.isInteger(candidate.grade)) return null;
  return {
    id: candidate.id,
    studentCode: candidate.studentCode,
    grade: candidate.grade,
    createdAt: candidate.createdAt
  };
}

function sanitizeStudentCode(value: string | null): string | null {
  if (!value) return null;
  const normalized = value.trim().toUpperCase();
  return /^[A-Z0-9_-]{1,24}$/.test(normalized) ? normalized : null;
}

function sanitizeGrade(value: string | null): number | null {
  if (!value) return null;
  const grade = Number(value);
  return Number.isInteger(grade) && grade >= 8 && grade <= 10 ? grade : null;
}

function createSessionId(): string {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (char) =>
    (Number(char) ^ (Math.random() * 16) >> (Number(char) / 4)).toString(16)
  );
}
