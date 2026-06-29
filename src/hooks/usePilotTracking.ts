import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  ensurePilotSession,
  sendPilotEvent,
  sendPilotQuizAttempt,
  type PilotChallengeEventType,
  type PilotEventInput
} from "@/lib/pilotEvents";
import { resolvePilotSessionFromUrl, type PilotSession } from "@/lib/pilotSession";
import type { QuizQuestion } from "@/lessons/schema";

export interface PilotTracker {
  session: PilotSession | null;
  trackStepCompleted(stepIndex: number): void;
  trackChallengeEvent(input: PilotChallengeEventInput): void;
  trackQuizAnswer(questionIndex: number, question: QuizQuestion, selectedIndex: number): void;
  trackQuizCompleted(mainScore: number, mainQuestionCount: number): void;
  trackNextLessonClicked(): void;
}

export interface PilotChallengeEventInput {
  stepIndex: number;
  challengeId: string;
  challengeEvent: PilotChallengeEventType;
  selectedIndex?: number;
  isCorrect?: boolean;
  failureMode?: string;
  timeOnTaskMs?: number;
  state?: Record<string, unknown>;
}

export function usePilotTracking(lessonId: string): PilotTracker {
  const [session, setSession] = useState<PilotSession | null>(null);
  const startedLessons = useRef(new Set<string>());

  useEffect(() => {
    setSession(resolvePilotSessionFromUrl(window.location.href));
  }, []);

  const trackEvent = useCallback(
    (event: Omit<PilotEventInput, "lessonId">) => {
      if (!session) return;
      void sendPilotEvent(session, {
        ...event,
        lessonId
      });
    },
    [lessonId, session]
  );

  useEffect(() => {
    if (!session || startedLessons.current.has(lessonId)) return;
    startedLessons.current.add(lessonId);
    void ensurePilotSession(session).finally(() => {
      void sendPilotEvent(session, {
        type: "lesson_started",
        lessonId
      });
    });
  }, [lessonId, session]);

  return useMemo(
    () => ({
      session,
      trackStepCompleted: (stepIndex: number) => {
        trackEvent({
          type: "step_completed",
          stepIndex
        });
      },
      trackChallengeEvent: (input: PilotChallengeEventInput) => {
        trackEvent({
          type: "challenge_event",
          stepIndex: input.stepIndex,
          challengeId: input.challengeId,
          challengeEvent: input.challengeEvent,
          selectedIndex: input.selectedIndex,
          isCorrect: input.isCorrect,
          failureMode: input.failureMode,
          timeOnTaskMs: input.timeOnTaskMs,
          state: input.state
        });
      },
      trackQuizAnswer: (questionIndex: number, question: QuizQuestion, selectedIndex: number) => {
        trackEvent({
          type: "quiz_answered",
          questionIndex,
          selectedIndex,
          isCorrect: selectedIndex === question.answerIndex,
          isMisconceptionCheck: Boolean(question.isMisconceptionCheck)
        });
        if (session) {
          void sendPilotQuizAttempt(session, {
            lessonId,
            questionIndex,
            question,
            selectedIndex
          });
        }
      },
      trackQuizCompleted: (mainScore: number, mainQuestionCount: number) => {
        trackEvent({
          type: "quiz_completed",
          mainScore,
          mainQuestionCount
        });
      },
      trackNextLessonClicked: () => {
        trackEvent({
          type: "next_lesson_clicked"
        });
      }
    }),
    [lessonId, session, trackEvent]
  );
}
