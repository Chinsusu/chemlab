import { describe, expect, it } from "vitest";

import { buildPilotReport, type PilotEventRow, type PilotQuizAttemptRow, type PilotSessionRow } from "@/lib/pilotReport";

function sessions(count: number): PilotSessionRow[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `session-${index + 1}`,
    student_code: `S${String(index + 1).padStart(2, "0")}`,
    grade: 8,
    created_at: "2026-06-29T00:00:00.000Z"
  }));
}

describe("pilot report", () => {
  it("computes MVP validation gates from grade 8 data", () => {
    const pilotSessions = sessions(15);
    const completedEvents: PilotEventRow[] = pilotSessions.slice(0, 11).map((session) => ({
      session_id: session.id,
      event_type: "step_completed",
      lesson_id: "phan-ung-tao-nuoc",
      step_index: 4,
      main_score: null,
      main_question_count: null,
      created_at: "2026-06-29T01:00:00.000Z"
    }));
    const quizEvents: PilotEventRow[] = pilotSessions.map((session, index) => ({
      session_id: session.id,
      event_type: "quiz_completed",
      lesson_id: "phan-ung-tao-nuoc",
      step_index: null,
      main_score: index < 11 ? 2 : 1,
      main_question_count: 2,
      created_at: "2026-06-29T01:05:00.000Z"
    }));
    const quizAttempts: PilotQuizAttemptRow[] = pilotSessions.map((session, index) => ({
      session_id: session.id,
      lesson_id: "phan-ung-tao-nuoc",
      question_index: 2,
      is_correct: index < 14,
      is_misconception_check: true,
      created_at: "2026-06-29T01:06:00.000Z"
    }));

    const report = buildPilotReport({
      sessions: pilotSessions,
      events: [
        ...completedEvents,
        ...quizEvents,
        {
          session_id: "session-1",
          event_type: "next_lesson_clicked",
          lesson_id: "phan-ung-tao-nuoc",
          step_index: null,
          main_score: null,
          main_question_count: null,
          created_at: "2026-06-29T01:10:00.000Z"
        }
      ],
      quizAttempts,
      lessonId: "phan-ung-tao-nuoc",
      lessonSignoff: {
        status: "published",
        reviewedBy: "GV KHTN",
        reviewDate: "2026-06-29"
      }
    });

    expect(report.sampleSize).toBe(15);
    expect(report.completionRate).toBe(0.7333);
    expect(report.quizAccuracy).toBe(0.8667);
    expect(report.misconceptionPassRate).toBe(0.9333);
    expect(report.gates).toMatchObject({
      completion: true,
      quiz: true,
      misconception: true,
      teacherSignoff: true
    });
    expect(report.decision).toBe("needs_manual_review");
  });
});
