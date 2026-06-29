export interface PilotSessionRow {
  id: string;
  student_code: string;
  grade: number;
  created_at: string;
}

export interface PilotEventRow {
  session_id: string;
  event_type: string;
  lesson_id: string;
  step_index: number | null;
  main_score: number | null;
  main_question_count: number | null;
  created_at: string;
}

export interface PilotQuizAttemptRow {
  session_id: string;
  lesson_id: string;
  question_index: number;
  is_correct: boolean;
  is_misconception_check: boolean;
  created_at: string;
}

export interface LessonSignoff {
  status: "draft" | "review" | "published";
  reviewedBy?: string;
  reviewDate?: string;
}

export interface PilotReportInput {
  sessions: PilotSessionRow[];
  events: PilotEventRow[];
  quizAttempts: PilotQuizAttemptRow[];
  lessonId: string;
  lessonSignoff: LessonSignoff;
}

export interface PilotReport {
  lessonId: string;
  grade: 8;
  sampleSize: number;
  completionRate: number;
  quizAccuracy: number;
  misconceptionPassRate: number;
  nextLessonClickRate: number;
  gates: {
    completion: boolean;
    quiz: boolean;
    misconception: boolean;
    teacherSignoff: boolean;
    repeatedScienceMisconception: "manual_required";
  };
  decision: "insufficient_sample" | "fail" | "needs_manual_review";
}

export function buildPilotReport(input: PilotReportInput): PilotReport {
  const grade8SessionIds = new Set(input.sessions.filter((session) => session.grade === 8).map((session) => session.id));
  const sampleSize = grade8SessionIds.size;
  const relevantEvents = input.events.filter(
    (event) => grade8SessionIds.has(event.session_id) && event.lesson_id === input.lessonId
  );
  const relevantAttempts = input.quizAttempts.filter(
    (attempt) => grade8SessionIds.has(attempt.session_id) && attempt.lesson_id === input.lessonId
  );

  const completedSessions = new Set(
    relevantEvents
      .filter((event) => event.event_type === "step_completed" && (event.step_index ?? -1) >= 4)
      .map((event) => event.session_id)
  );
  const nextClickSessions = new Set(
    relevantEvents
      .filter((event) => event.event_type === "next_lesson_clicked")
      .map((event) => event.session_id)
  );
  const latestQuizCompletions = latestBySession(
    relevantEvents.filter((event) => event.event_type === "quiz_completed")
  );
  const quizTotals = [...latestQuizCompletions.values()].reduce(
    (total, event) => ({
      score: total.score + (event.main_score ?? 0),
      count: total.count + (event.main_question_count ?? 0)
    }),
    { score: 0, count: 0 }
  );
  const latestMisconceptionAttempts = latestBySession(
    relevantAttempts.filter((attempt) => attempt.is_misconception_check)
  );
  const misconceptionCorrect = [...latestMisconceptionAttempts.values()].filter(
    (attempt) => attempt.is_correct
  ).length;

  const completionRate = rate(completedSessions.size, sampleSize);
  const quizAccuracy = rate(quizTotals.score, quizTotals.count);
  const misconceptionPassRate = rate(misconceptionCorrect, sampleSize);
  const nextLessonClickRate = rate(nextClickSessions.size, sampleSize);
  const teacherSignoff = Boolean(
    input.lessonSignoff.status === "published" &&
      input.lessonSignoff.reviewedBy &&
      input.lessonSignoff.reviewDate
  );

  const gates = {
    completion: completionRate >= 0.7,
    quiz: quizAccuracy >= 0.7,
    misconception: misconceptionPassRate >= 0.9,
    teacherSignoff,
    repeatedScienceMisconception: "manual_required" as const
  };

  return {
    lessonId: input.lessonId,
    grade: 8,
    sampleSize,
    completionRate,
    quizAccuracy,
    misconceptionPassRate,
    nextLessonClickRate,
    gates,
    decision: getDecision(sampleSize, gates)
  };
}

function latestBySession<T extends { session_id: string; created_at: string }>(items: T[]): Map<string, T> {
  const latest = new Map<string, T>();
  for (const item of items) {
    const current = latest.get(item.session_id);
    if (!current || current.created_at < item.created_at) {
      latest.set(item.session_id, item);
    }
  }
  return latest;
}

function rate(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return Number((numerator / denominator).toFixed(4));
}

function getDecision(sampleSize: number, gates: PilotReport["gates"]): PilotReport["decision"] {
  if (sampleSize < 15) return "insufficient_sample";
  if (!gates.completion || !gates.quiz || !gates.misconception || !gates.teacherSignoff) {
    return "fail";
  }
  return "needs_manual_review";
}
