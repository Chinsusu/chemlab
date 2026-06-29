import { describe, expect, it } from "vitest";

import {
  createMemoryStorage,
  emptyProgress,
  loadProgress,
  saveProgress,
  withCompletedLesson,
  withLessonStep,
  withNextLessonClick
} from "@/lib/storage";

describe("progress storage", () => {
  it("persists completed lessons, current step, and next-lesson clicks", () => {
    const storage = createMemoryStorage();
    const progress = withNextLessonClick(
      withLessonStep(withCompletedLesson(emptyProgress, "phan-ung-tao-nuoc"), "phan-ung-tao-nuoc", 4),
      "phan-ung-tao-nuoc"
    );

    saveProgress(progress, storage);

    expect(loadProgress(storage)).toEqual({
      completedLessonIds: ["phan-ung-tao-nuoc"],
      lessonSteps: { "phan-ung-tao-nuoc": 4 },
      nextLessonClicks: { "phan-ung-tao-nuoc": 1 }
    });
  });

  it("falls back to empty progress when stored data is invalid", () => {
    const storage = createMemoryStorage({
      "chemlab.progress.v1": "{not-json"
    });

    expect(loadProgress(storage)).toEqual(emptyProgress);
  });
});
