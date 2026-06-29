import { z } from "zod";

const STORAGE_KEY = "chemlab.progress.v1";

const ProgressSchema = z.object({
  completedLessonIds: z.array(z.string()),
  nextLessonClicks: z.record(z.string(), z.number().int().nonnegative()),
  lessonSteps: z.record(z.string(), z.number().int().nonnegative())
});

export type ProgressState = z.infer<typeof ProgressSchema>;

export const emptyProgress: ProgressState = {
  completedLessonIds: [],
  nextLessonClicks: {},
  lessonSteps: {}
};

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function loadProgress(storage: StorageLike = window.localStorage): ProgressState {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return emptyProgress;
    const parsed = ProgressSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : emptyProgress;
  } catch {
    return emptyProgress;
  }
}

export function saveProgress(
  progress: ProgressState,
  storage: StorageLike = window.localStorage
): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function clearProgress(storage: StorageLike = window.localStorage): void {
  storage.removeItem(STORAGE_KEY);
}

export function withCompletedLesson(progress: ProgressState, lessonId: string): ProgressState {
  if (progress.completedLessonIds.includes(lessonId)) return progress;
  return {
    ...progress,
    completedLessonIds: [...progress.completedLessonIds, lessonId]
  };
}

export function withLessonStep(
  progress: ProgressState,
  lessonId: string,
  stepIndex: number
): ProgressState {
  return {
    ...progress,
    lessonSteps: {
      ...progress.lessonSteps,
      [lessonId]: stepIndex
    }
  };
}

export function withNextLessonClick(progress: ProgressState, lessonId: string): ProgressState {
  return {
    ...progress,
    nextLessonClicks: {
      ...progress.nextLessonClicks,
      [lessonId]: (progress.nextLessonClicks[lessonId] ?? 0) + 1
    }
  };
}

export function createMemoryStorage(initial: Record<string, string> = {}): StorageLike {
  const state = new Map(Object.entries(initial));
  return {
    getItem: (key) => state.get(key) ?? null,
    setItem: (key, value) => state.set(key, value),
    removeItem: (key) => state.delete(key)
  };
}
