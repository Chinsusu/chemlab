import { afterEach, describe, expect, it, vi } from "vitest";

import {
  normalizeSupabaseBaseUrl,
  sendPilotEvent,
  sendPilotQuizAttempt
} from "@/lib/pilotEvents";
import type { PilotSession } from "@/lib/pilotSession";
import type { QuizQuestion } from "@/lessons/schema";

const session: PilotSession = {
  id: "00000000-0000-0000-0000-000000000001",
  studentCode: "S01",
  grade: 8,
  createdAt: "2026-06-29T00:00:00.000Z"
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("pilot events", () => {
  it("normalizes Supabase project URLs for REST calls", () => {
    expect(normalizeSupabaseBaseUrl("https://example.supabase.co/rest/v1/")).toBe(
      "https://example.supabase.co"
    );
    expect(normalizeSupabaseBaseUrl("https://example.supabase.co")).toBe(
      "https://example.supabase.co"
    );
  });

  it("falls back silently when Supabase is not configured", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      sendPilotEvent(session, {
        type: "lesson_started",
        lessonId: "phan-ung-tao-nuoc"
      })
    ).resolves.toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("inserts quiz attempts through Supabase REST when configured", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 201 });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("VITE_SUPABASE_URL", "https://example.supabase.co/rest/v1");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "anon-key");
    const question: QuizQuestion = {
      q: "PTHH cân bằng là gì?",
      options: ["A", "B"],
      answerIndex: 1,
      mapsToObjective: 0,
      feedback: "B"
    };

    await expect(
      sendPilotQuizAttempt(session, {
        lessonId: "phan-ung-tao-nuoc",
        questionIndex: 0,
        question,
        selectedIndex: 1
      })
    ).resolves.toBe(true);

    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.supabase.co/rest/v1/pilot_quiz_attempts",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining('"is_correct":true')
      })
    );
  });
});
