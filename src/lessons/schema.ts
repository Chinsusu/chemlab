import { z } from "zod";

export const AnimationIdSchema = z.enum(["sun", "h-atom", "combustion"]);
export const InteractiveIdSchema = z.enum(["star-slider", "ratio-mixer", "temp-control"]);

const stepBase = {
  curriculumScope: z.enum(["core", "outOfCurriculum"]),
  estimatedMinutes: z.number().positive(),
  sgkChip: z.string().min(1)
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
  interactive: InteractiveIdSchema.optional(),
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
  interactive: InteractiveIdSchema.optional(),
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
  .refine((q) => q.answerIndex < q.options.length, {
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
export type HookStep = z.infer<typeof HookStepSchema>;
export type ConceptStep = z.infer<typeof ConceptStepSchema>;
export type ReactionSpecies = z.infer<typeof ReactionSpeciesSchema>;
export type ReactionStep = z.infer<typeof ReactionStepSchema>;
export type RealworldStep = z.infer<typeof RealworldStepSchema>;
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;
export type QuizStep = z.infer<typeof QuizStepSchema>;
export type Lesson = z.infer<typeof LessonSchema>;
