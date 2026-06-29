import { LessonSchema, type Lesson, type ReactionSpecies } from "@/lessons/schema";

export function validateLesson(lesson: unknown): string[] {
  const parsed = LessonSchema.safeParse(lesson);
  if (!parsed.success) {
    return parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
  }

  const lessonData = parsed.data;
  const errors: string[] = [];

  const totalMinutes = lessonData.steps.reduce((sum, step) => sum + step.estimatedMinutes, 0);
  const outMinutes = lessonData.steps
    .filter((step) => step.curriculumScope === "outOfCurriculum")
    .reduce((sum, step) => sum + step.estimatedMinutes, 0);

  if (totalMinutes > 0 && outMinutes / totalMinutes > 0.2) {
    errors.push(`Phần ngoài CT chiếm ${Math.round((outMinutes / totalMinutes) * 100)}% > 20%`);
  }

  const quiz = lessonData.steps[4];
  for (const question of quiz.questions) {
    if (
      question.mapsToObjective !== -1 &&
      question.mapsToObjective >= lessonData.sgkMatrix.objectives.length
    ) {
      errors.push("mapsToObjective vượt số mục tiêu cần đạt");
    }
  }

  const hasOutOfCurriculum = lessonData.steps.some(
    (step) => step.curriculumScope === "outOfCurriculum"
  );
  if (hasOutOfCurriculum && !quiz.questions.some((question) => question.isMisconceptionCheck)) {
    errors.push("Bài có phần ngoài CT nhưng quiz thiếu câu kiểm tra hiểu nhầm");
  }

  const reaction = lessonData.steps.find((step) => step.type === "reaction");
  if (reaction?.type === "reaction") {
    if (!lessonData.meta.hasSafetyWarning) {
      errors.push("Bài có phản ứng nhưng meta.hasSafetyWarning = false");
    }
    if (!reaction.safetyNote) {
      errors.push("Bước reaction thiếu safetyNote");
    }

    const lhs = tallyAtoms(reaction.reactants);
    const rhs = tallyAtoms(reaction.products);
    const elements = new Set([...Object.keys(lhs), ...Object.keys(rhs)]);
    for (const element of elements) {
      if ((lhs[element] ?? 0) !== (rhs[element] ?? 0)) {
        errors.push(`Phản ứng chưa cân bằng nguyên tố ${element}`);
      }
    }
  }

  for (const step of lessonData.steps) {
    if (
      step.curriculumScope === "outOfCurriculum" &&
      !/ngoai chuong trinh|ngoài chương trình/i.test(step.sgkChip)
    ) {
      errors.push(`Bước ngoài CT cần chip "Ngoài chương trình: ..." (${step.sgkChip})`);
    }
  }

  if (
    lessonData.meta.status === "published" &&
    (!lessonData.meta.reviewedBy || !lessonData.meta.reviewDate)
  ) {
    errors.push("Không được publish khi chưa có reviewedBy + reviewDate");
  }

  return errors;
}

export function assertValidLesson(lesson: unknown): Lesson {
  const errors = validateLesson(lesson);
  if (errors.length > 0) {
    throw new Error(`Lesson không hợp lệ:\n${errors.join("\n")}`);
  }
  return LessonSchema.parse(lesson);
}

function tallyAtoms(species: ReactionSpecies[]) {
  const totals: Record<string, number> = {};
  for (const item of species) {
    for (const [element, count] of Object.entries(item.atomCounts)) {
      totals[element] = (totals[element] ?? 0) + item.coefficient * count;
    }
  }
  return totals;
}
