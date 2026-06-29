import { z } from "zod";

export const AnimationIdSchema = z.enum(["sun", "h-atom", "combustion"]);
export const InteractiveIdSchema = z.enum(["ratio-mixer", "combine"]);

export const PredictSchema = z
  .object({
    prompt: z.string().min(1),
    options: z.array(z.string().min(1)).min(2).max(4),
    correctIndex: z.number().int().nonnegative(),
    allowWrongToReveal: z.literal(true)
  })
  .refine((predict) => predict.correctIndex < predict.options.length, {
    message: "predict.correctIndex ngoài mảng options"
  });

export const SuccessCriteriaSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("choice"),
    correctIndex: z.number().int().nonnegative()
  }),
  z.object({
    kind: z.literal("target"),
    goal: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
  }),
  z.object({
    kind: z.literal("exploreCount"),
    min: z.number().int().positive()
  }),
  z.object({
    kind: z.literal("answerAll"),
    minCorrect: z.number().int().nonnegative()
  })
]);

export const ChallengeSchema = z
  .object({
    id: z.string().min(1),
    type: z.enum(["predict", "manipulate", "explore", "recall"]),
    prompt: z.string().min(1),
    predict: PredictSchema.optional(),
    interactive: z
      .object({
        id: InteractiveIdSchema,
        params: z.record(z.string(), z.unknown()).optional()
      })
      .optional(),
    successCriteria: SuccessCriteriaSchema,
    feedback: z
      .object({
        onWrong: z.string().optional(),
        byMode: z.record(z.string(), z.string()).optional()
      })
      .optional(),
    explanation: z.string().min(1),
    misconceptionCheck: z.boolean(),
    telemetry: z.object({
      events: z
        .array(
          z.enum([
            "attempt",
            "predictChoice",
            "timeOnTask",
            "wrongOption",
            "solved",
            "revealOpened"
          ])
        )
        .min(1),
      objectiveRef: z.number().int().nonnegative().optional()
    })
  })
  .superRefine((challenge, ctx) => {
    if (challenge.type === "predict") {
      if (!challenge.predict) {
        ctx.addIssue({ code: "custom", message: "type 'predict' phải có predict" });
      }
      if (challenge.successCriteria.kind !== "choice") {
        ctx.addIssue({ code: "custom", message: "predict ⇒ successCriteria='choice'" });
      }
      if (challenge.interactive) {
        ctx.addIssue({ code: "custom", message: "type 'predict' không dùng interactive" });
      }
    }

    if (challenge.type === "manipulate") {
      if (!challenge.interactive) {
        ctx.addIssue({ code: "custom", message: "type 'manipulate' phải có interactive" });
      }
      if (challenge.successCriteria.kind !== "target") {
        ctx.addIssue({ code: "custom", message: "manipulate ⇒ successCriteria='target'" });
      }
    }

    if (challenge.type === "explore" && challenge.successCriteria.kind !== "exploreCount") {
      ctx.addIssue({ code: "custom", message: "explore ⇒ successCriteria='exploreCount'" });
    }

    if (challenge.type === "recall" && challenge.successCriteria.kind !== "answerAll") {
      ctx.addIssue({ code: "custom", message: "recall ⇒ successCriteria='answerAll'" });
    }
  });

const stepBase = {
  curriculumScope: z.enum(["core", "outOfCurriculum"]),
  estimatedMinutes: z.number().positive(),
  sgkChip: z.string().min(1),
  challenge: ChallengeSchema
};

export const HookStepSchema = z.object({
  type: z.literal("hook"),
  title: z.string().min(1),
  body: z.string().min(1),
  facts: z.array(z.string()).min(1),
  animation: AnimationIdSchema,
  ...stepBase
});

export const ConceptStepSchema = z.object({
  type: z.literal("concept"),
  title: z.string().min(1),
  body: z.string().min(1),
  animation: AnimationIdSchema.optional(),
  ...stepBase
});

export const ReactionSpeciesSchema = z.object({
  formula: z.string().min(1),
  coefficient: z.number().int().positive(),
  atomCounts: z.record(z.string(), z.number().int().nonnegative())
});

export const ReactionStepSchema = z.object({
  type: z.literal("reaction"),
  title: z.string().min(1),
  reactants: z.array(ReactionSpeciesSchema).min(1),
  products: z.array(ReactionSpeciesSchema).min(1),
  displayEquation: z.string().min(1),
  safetyNote: z.string().min(1),
  ...stepBase
});

export const RealworldStepSchema = z.object({
  type: z.literal("realworld"),
  title: z.string().min(1),
  items: z
    .array(
      z.object({
        icon: z.string(),
        label: z.string().min(1),
        note: z.string().min(1)
      })
    )
    .min(1),
  ...stepBase
});

export const QuizQuestionSchema = z
  .object({
    q: z.string().min(1),
    options: z.array(z.string().min(1)).min(2).max(4),
    answerIndex: z.number().int().nonnegative(),
    mapsToObjective: z.number().int().min(-1),
    isMisconceptionCheck: z.boolean().optional(),
    feedback: z.string().min(1)
  })
  .refine((question) => question.answerIndex < question.options.length, {
    message: "answerIndex phải nằm trong [0, options.length)"
  });

export const QuizStepSchema = z.object({
  type: z.literal("quiz"),
  questions: z.array(QuizQuestionSchema).length(3),
  ...stepBase
});

export const Step3Schema = z.discriminatedUnion("type", [ConceptStepSchema, ReactionStepSchema]);
export const StepsTupleSchema = z.tuple([
  HookStepSchema,
  ConceptStepSchema,
  Step3Schema,
  RealworldStepSchema,
  QuizStepSchema
]);

export const LessonSchema = z.object({
  id: z.string().min(1),
  question: z.string().min(1),
  topicTags: z.array(z.string()).min(1),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  meta: z.object({
    sgkSources: z.array(z.string()).min(1),
    author: z.string().min(1),
    reviewedBy: z.string().optional(),
    reviewDate: z.string().optional(),
    status: z.enum(["draft", "review", "published"]),
    hasSafetyWarning: z.boolean()
  }),
  sgkMatrix: z.object({
    grade: z.number().int(),
    books: z.array(z.enum(["KNTT", "CTST", "CD"])).min(1),
    standards: z.array(z.string()).min(1),
    objectives: z.array(z.string()).min(1).max(3),
    prerequisites: z.array(z.string()),
    outOfCurriculum: z.array(z.string())
  }),
  steps: StepsTupleSchema,
  nextLessonId: z.string().optional()
});

export type AnimationId = z.infer<typeof AnimationIdSchema>;
export type InteractiveId = z.infer<typeof InteractiveIdSchema>;
export type Predict = z.infer<typeof PredictSchema>;
export type SuccessCriteria = z.infer<typeof SuccessCriteriaSchema>;
export type Challenge = z.infer<typeof ChallengeSchema>;
export type HookStep = z.infer<typeof HookStepSchema>;
export type ConceptStep = z.infer<typeof ConceptStepSchema>;
export type ReactionSpecies = z.infer<typeof ReactionSpeciesSchema>;
export type ReactionStep = z.infer<typeof ReactionStepSchema>;
export type RealworldStep = z.infer<typeof RealworldStepSchema>;
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;
export type QuizStep = z.infer<typeof QuizStepSchema>;
export type Lesson = z.infer<typeof LessonSchema>;
