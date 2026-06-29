import { phanUngTaoNuoc } from "../src/lessons/data/phan-ung-tao-nuoc";
import {
  buildPilotReport,
  type PilotEventRow,
  type PilotQuizAttemptRow,
  type PilotSessionRow
} from "../src/lib/pilotReport";

const lessonId = process.argv[2] ?? phanUngTaoNuoc.id;
const supabaseUrl = normalizeSupabaseBaseUrl(process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL);
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Thiếu SUPABASE_URL/VITE_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabaseRestUrl = supabaseUrl;
const serviceRole = serviceRoleKey;

const [sessions, events, quizAttempts] = await Promise.all([
  fetchRows<PilotSessionRow>("pilot_sessions", "select=id,student_code,grade,created_at"),
  fetchRows<PilotEventRow>(
    "pilot_events",
    `select=session_id,event_type,lesson_id,step_index,main_score,main_question_count,created_at&lesson_id=eq.${encodeURIComponent(lessonId)}`
  ),
  fetchRows<PilotQuizAttemptRow>(
    "pilot_quiz_attempts",
    `select=session_id,lesson_id,question_index,is_correct,is_misconception_check,created_at&lesson_id=eq.${encodeURIComponent(lessonId)}`
  )
]);

const report = buildPilotReport({
  sessions,
  events,
  quizAttempts,
  lessonId,
  lessonSignoff: phanUngTaoNuoc.meta
});

console.log(JSON.stringify(report, null, 2));

async function fetchRows<T>(table: string, query: string): Promise<T[]> {
  const response = await fetch(`${supabaseRestUrl}/rest/v1/${table}?${query}`, {
    headers: {
      apikey: serviceRole,
      authorization: `Bearer ${serviceRole}`
    }
  });
  if (!response.ok) {
    throw new Error(`Không đọc được ${table}: ${response.status} ${await response.text()}`);
  }
  return (await response.json()) as T[];
}

function normalizeSupabaseBaseUrl(value: string | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim().replace(/\/+$/, "");
  return trimmed ? trimmed.replace(/\/rest\/v1$/i, "") : null;
}
