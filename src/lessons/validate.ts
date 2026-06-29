import { LessonSchema, type Lesson, type ReactionSpecies } from "@/lessons/schema";

const MVP_INTERACTIVE_IDS = new Set(["ratio-mixer", "combine"]);

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

  const hookChallenge = lessonData.steps[0].challenge;
  const quizChallenge = lessonData.steps[4].challenge;
  if (hookChallenge.type !== "predict") {
    errors.push("Bước Hook nên là challenge type 'predict' (đoán → mở)");
  }
  if (quizChallenge.type !== "recall") {
    errors.push("Bước Quiz phải là challenge type 'recall'");
  }

  if (
    hasOutOfCurriculum &&
    !lessonData.steps.some((step) => step.challenge.misconceptionCheck)
  ) {
    errors.push("Bài có phần ngoài CT nhưng không challenge nào misconceptionCheck=true");
  }

  lessonData.steps.forEach((step) => {
    const challenge = step.challenge;
    if (
      challenge.type === "manipulate" &&
      (!challenge.interactive || !MVP_INTERACTIVE_IDS.has(challenge.interactive.id))
    ) {
      errors.push(`Challenge ${challenge.id}: manipulate thiếu interactive MVP hợp lệ`);
    }

    if (
      challenge.type === "predict" &&
      challenge.predict &&
      challenge.successCriteria.kind === "choice" &&
      challenge.successCriteria.correctIndex >= challenge.predict.options.length
    ) {
      errors.push(`Challenge ${challenge.id}: successCriteria.correctIndex ngoài mảng options`);
    }

    if (
      challenge.type === "recall" &&
      challenge.successCriteria.kind === "answerAll" &&
      "questions" in step &&
      challenge.successCriteria.minCorrect > step.questions.length
    ) {
      errors.push(`Challenge ${challenge.id}: minCorrect vượt số câu hỏi`);
    }

    if (
      challenge.telemetry.objectiveRef !== undefined &&
      challenge.telemetry.objectiveRef >= lessonData.sgkMatrix.objectives.length
    ) {
      errors.push(`Challenge ${challenge.id}: telemetry.objectiveRef vượt số mục tiêu cần đạt`);
    }
  });

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
