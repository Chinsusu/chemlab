import type { PilotSession } from "@/lib/pilotSession";
import type { QuizQuestion } from "@/lessons/schema";

export type PilotEventType =
  | "lesson_started"
  | "step_completed"
  | "quiz_answered"
  | "quiz_completed"
  | "next_lesson_clicked";

export interface PilotEventInput {
  type: PilotEventType;
  lessonId: string;
  stepIndex?: number;
  questionIndex?: number;
  selectedIndex?: number;
  isCorrect?: boolean;
  isMisconceptionCheck?: boolean;
  mainScore?: number;
  mainQuestionCount?: number;
}

export interface PilotQuizAttemptInput {
  lessonId: string;
  questionIndex: number;
  question: QuizQuestion;
  selectedIndex: number;
}

export async function ensurePilotSession(session: PilotSession | null): Promise<boolean> {
  if (!session) return false;
  return postSupabaseRow("pilot_sessions", {
    id: session.id,
    student_code: session.studentCode,
    grade: session.grade,
    created_at: session.createdAt
  });
}

export async function sendPilotEvent(
  session: PilotSession | null,
  event: PilotEventInput
): Promise<boolean> {
  if (!session) return false;
  return postSupabaseRow("pilot_events", {
    session_id: session.id,
    event_type: event.type,
    lesson_id: event.lessonId,
    step_index: event.stepIndex,
    question_index: event.questionIndex,
    selected_index: event.selectedIndex,
    is_correct: event.isCorrect,
    is_misconception_check: event.isMisconceptionCheck,
    main_score: event.mainScore,
    main_question_count: event.mainQuestionCount
  });
}

export async function sendPilotQuizAttempt(
  session: PilotSession | null,
  input: PilotQuizAttemptInput
): Promise<boolean> {
  if (!session) return false;
  return postSupabaseRow("pilot_quiz_attempts", {
    session_id: session.id,
    lesson_id: input.lessonId,
    question_index: input.questionIndex,
    selected_index: input.selectedIndex,
    is_correct: input.selectedIndex === input.question.answerIndex,
    is_misconception_check: Boolean(input.question.isMisconceptionCheck)
  });
}

export function getSupabaseRestUrl(table: string): string | null {
  const baseUrl = normalizeSupabaseBaseUrl(import.meta.env.VITE_SUPABASE_URL);
  if (!baseUrl || !import.meta.env.VITE_SUPABASE_ANON_KEY) return null;
  return `${baseUrl}/rest/v1/${table}`;
}

export function normalizeSupabaseBaseUrl(value: string | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim().replace(/\/+$/, "");
  if (!trimmed) return null;
  return trimmed.replace(/\/rest\/v1$/i, "");
}

async function postSupabaseRow(table: string, body: Record<string, unknown>): Promise<boolean> {
  const url = getSupabaseRestUrl(table);
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return false;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        apikey: key,
        authorization: `Bearer ${key}`,
        "content-type": "application/json",
        prefer: "return=minimal"
      },
      body: JSON.stringify(stripUndefined(body))
    });
    return response.ok || response.status === 409;
  } catch {
    return false;
  }
}

function stripUndefined(value: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined));
}
