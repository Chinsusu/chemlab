import { useCallback, useEffect, useState } from "react";

import {
  emptyProgress,
  loadProgress,
  saveProgress,
  withCompletedLesson,
  withLessonStep,
  withNextLessonClick,
  type ProgressState
} from "@/lib/storage";

export function useProgress() {
  const [progress, setProgress] = useState<ProgressState>(emptyProgress);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const updateProgress = useCallback((updater: (current: ProgressState) => ProgressState) => {
    setProgress((current) => {
      const next = updater(current);
      saveProgress(next);
      return next;
    });
  }, []);

  const markStep = useCallback(
    (lessonId: string, stepIndex: number) => {
      updateProgress((current) => withLessonStep(current, lessonId, stepIndex));
    },
    [updateProgress]
  );

  const completeLesson = useCallback(
    (lessonId: string) => {
      updateProgress((current) => withCompletedLesson(current, lessonId));
    },
    [updateProgress]
  );

  const recordNextLessonClick = useCallback(
    (lessonId: string) => {
      updateProgress((current) => withNextLessonClick(current, lessonId));
    },
    [updateProgress]
  );

  return {
    progress,
    markStep,
    completeLesson,
    recordNextLessonClick
  };
}
