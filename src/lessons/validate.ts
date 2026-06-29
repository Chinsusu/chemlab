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
    errors.push(`Phan ngoai CT chiem ${Math.round((outMinutes / totalMinutes) * 100)}% > 20%`);
  }

  const quiz = lessonData.steps[4];
  for (const question of quiz.questions) {
    if (
      question.mapsToObjective !== -1 &&
      question.mapsToObjective >= lessonData.sgkMatrix.objectives.length
    ) {
      errors.push("mapsToObjective vuot so muc tieu can dat");
    }
  }

  const hasOutOfCurriculum = lessonData.steps.some(
    (step) => step.curriculumScope === "outOfCurriculum"
  );
  if (hasOutOfCurriculum && !quiz.questions.some((question) => question.isMisconceptionCheck)) {
    errors.push("Bai co phan ngoai CT nhung quiz thieu cau kiem tra hieu nham");
  }

  const reaction = lessonData.steps.find((step) => step.type === "reaction");
  if (reaction?.type === "reaction") {
    if (!lessonData.meta.hasSafetyWarning) {
      errors.push("Bai co phan ung nhung meta.hasSafetyWarning = false");
    }
    if (!reaction.safetyNote) {
      errors.push("Buoc reaction thieu safetyNote");
    }

    const lhs = tallyAtoms(reaction.reactants);
    const rhs = tallyAtoms(reaction.products);
    const elements = new Set([...Object.keys(lhs), ...Object.keys(rhs)]);
    for (const element of elements) {
      if ((lhs[element] ?? 0) !== (rhs[element] ?? 0)) {
        errors.push(`Phan ung chua can bang nguyen to ${element}`);
      }
    }
  }

  for (const step of lessonData.steps) {
    if (
      step.curriculumScope === "outOfCurriculum" &&
      !/ngoai chuong trinh|ngoài chương trình/i.test(step.sgkChip)
    ) {
      errors.push(`Buoc ngoai CT can chip "Ngoai chuong trinh: ..." (${step.sgkChip})`);
    }
  }

  if (
    lessonData.meta.status === "published" &&
    (!lessonData.meta.reviewedBy || !lessonData.meta.reviewDate)
  ) {
    errors.push("Khong duoc publish khi chua co reviewedBy + reviewDate");
  }

  return errors;
}

export function assertValidLesson(lesson: unknown): Lesson {
  const errors = validateLesson(lesson);
  if (errors.length > 0) {
    throw new Error(`Lesson invalid:\n${errors.join("\n")}`);
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
