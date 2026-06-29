import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import { getAnimation } from "@/animations/registry";
import { Formula } from "@/components/lesson/Formula";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import type { useProgress } from "@/hooks/useProgress";
import type { PilotTracker } from "@/hooks/usePilotTracking";
import { getInteractive, type InteractiveHandle, type InteractiveResult } from "@/interactives/registry";
import type { Challenge, Lesson, QuizQuestion } from "@/lessons/schema";

interface LessonRendererProps {
  lesson: Lesson;
  progressApi?: ReturnType<typeof useProgress>;
  pilotTracker?: PilotTracker;
}

export function LessonRenderer({ lesson, progressApi, pilotTracker }: LessonRendererProps) {
  const initialStep = progressApi?.progress.lessonSteps[lesson.id] ?? 0;
  const lastStepIndex = lesson.steps.length - 1;
  const [activeStep, setActiveStep] = useState(Math.min(initialStep, lastStepIndex));
  const [maxUnlockedStep, setMaxUnlockedStep] = useState(Math.min(initialStep, lastStepIndex));
  const [solvedSteps, setSolvedSteps] = useState<Set<number>>(
    () => new Set(Array.from({ length: Math.min(initialStep, lastStepIndex) }, (_, index) => index))
  );
  const reducedMotion = usePrefersReducedMotion();
  const step = lesson.steps[activeStep] ?? lesson.steps[0];
  const savedStep = progressApi?.progress.lessonSteps[lesson.id];

  useEffect(() => {
    if (savedStep === undefined) return;
    const nextStep = Math.min(savedStep, lastStepIndex);
    setActiveStep(nextStep);
    setMaxUnlockedStep((current) => Math.max(current, nextStep));
  }, [lastStepIndex, savedStep]);

  const goToStep = (stepIndex: number) => {
    const nextStep = Math.max(0, Math.min(maxUnlockedStep, stepIndex));
    setActiveStep(nextStep);
    progressApi?.markStep(lesson.id, nextStep);
  };

  const handleChallengeSolved = (stepIndex: number) => {
    setSolvedSteps((current) => {
      if (current.has(stepIndex)) return current;
      const next = new Set(current);
      next.add(stepIndex);
      pilotTracker?.trackStepCompleted(stepIndex);
      return next;
    });
    setMaxUnlockedStep((current) => Math.max(current, Math.min(stepIndex + 1, lastStepIndex)));
    if (stepIndex === lastStepIndex) {
      progressApi?.completeLesson(lesson.id);
    }
  };

  const handleNextLessonClick = () => {
    progressApi?.completeLesson(lesson.id);
    progressApi?.recordNextLessonClick(lesson.id);
    pilotTracker?.trackNextLessonClicked();
  };

  const canGoNext = activeStep < maxUnlockedStep;

  return (
    <main className="lesson-shell">
      <div className="lesson-topbar">
        <Link className="button button--ghost" to="/">
          ← Khám phá
        </Link>
        <Link className="button button--secondary" to={`/lab/${lesson.id}`}>
          Mô phỏng lab
        </Link>
      </div>

      <section className="lesson-card" aria-labelledby="lesson-title">
        <div className="lesson-heading">
          <span className="topic-chip">KHTN {lesson.sgkMatrix.grade}</span>
          <h1 id="lesson-title">{lesson.question}</h1>
          <p>{lesson.sgkMatrix.objectives[0]}</p>
        </div>

        <Stepper activeStep={activeStep} maxUnlockedStep={maxUnlockedStep} setActiveStep={goToStep} />

        <motion.div
          key={activeStep}
          initial={reducedMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <MissionRenderer
            isSolved={solvedSteps.has(activeStep)}
            lesson={lesson}
            onSolved={() => handleChallengeSolved(activeStep)}
            pilotTracker={pilotTracker}
            reducedMotion={reducedMotion}
            step={step}
            stepIndex={activeStep}
          />
        </motion.div>

        <div className="lesson-actions">
          <button
            className="button button--secondary"
            disabled={activeStep === 0}
            onClick={() => goToStep(activeStep - 1)}
            type="button"
          >
            ← Bước trước
          </button>
          {activeStep < lesson.steps.length - 1 ? (
            <button
              className="button button--primary"
              disabled={!canGoNext}
              onClick={() => goToStep(activeStep + 1)}
              type="button"
            >
              Bước tiếp theo →
            </button>
          ) : (
            <Link
              aria-disabled={!solvedSteps.has(lastStepIndex)}
              className={`button button--primary ${!solvedSteps.has(lastStepIndex) ? "is-disabled" : ""}`}
              onClick={(event) => {
                if (!solvedSteps.has(lastStepIndex)) {
                  event.preventDefault();
                  return;
                }
                handleNextLessonClick();
              }}
              to="/"
            >
              Học bài tiếp theo →
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}

function Stepper({
  activeStep,
  maxUnlockedStep,
  setActiveStep
}: {
  activeStep: number;
  maxUnlockedStep: number;
  setActiveStep: (step: number) => void;
}) {
  const labels = ["Hook", "Khái niệm", "Phản ứng", "Thực tế", "Quiz"];
  return (
    <ol className="stepper" aria-label="Tiến độ bài học">
      {labels.map((label, index) => (
        <li className={index <= activeStep ? "is-active" : ""} key={label}>
          <button
            aria-current={index === activeStep ? "step" : undefined}
            disabled={index > maxUnlockedStep}
            onClick={() => setActiveStep(index)}
            type="button"
          >
            <span>{index + 1}</span>
            <small>{label}</small>
          </button>
        </li>
      ))}
    </ol>
  );
}

function MissionRenderer({
  isSolved,
  lesson,
  onSolved,
  pilotTracker,
  reducedMotion,
  step,
  stepIndex
}: {
  isSolved: boolean;
  lesson: Lesson;
  onSolved: () => void;
  pilotTracker?: PilotTracker;
  reducedMotion: boolean;
  step: Lesson["steps"][number];
  stepIndex: number;
}) {
  const Animation = "animation" in step && step.animation ? getAnimation(step.animation) : null;

  return (
    <article className="step-view">
      <div className={`sgk-chip ${step.curriculumScope === "outOfCurriculum" ? "sgk-chip--out" : ""}`}>
        {step.sgkChip}
      </div>

      {"title" in step ? <h2>{step.title}</h2> : <h2>Kiểm tra nhanh</h2>}
      {"body" in step ? <p>{step.body}</p> : null}

      {Animation ? <Animation data={step} reducedMotion={reducedMotion} /> : null}
      {step.type === "hook" ? <Facts facts={step.facts} /> : null}
      {step.type === "reaction" ? (
        <>
          <Formula reactants={step.reactants} products={step.products} />
          <div className="safety-note">
            <strong>An toàn:</strong> {step.safetyNote}
          </div>
          <ReactionAnimation step={step} reducedMotion={reducedMotion} />
        </>
      ) : null}

      <ChallengeRenderer
        challenge={step.challenge}
        isSolved={isSolved}
        lesson={lesson}
        onSolved={onSolved}
        pilotTracker={pilotTracker}
        reducedMotion={reducedMotion}
        step={step}
        stepIndex={stepIndex}
      />
    </article>
  );
}

function ChallengeRenderer({
  challenge,
  isSolved,
  lesson,
  onSolved,
  pilotTracker,
  reducedMotion,
  step,
  stepIndex
}: {
  challenge: Challenge;
  isSolved: boolean;
  lesson: Lesson;
  onSolved: () => void;
  pilotTracker?: PilotTracker;
  reducedMotion: boolean;
  step: Lesson["steps"][number];
  stepIndex: number;
}) {
  const [selectedPrediction, setSelectedPrediction] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(isSolved);
  const [failureText, setFailureText] = useState<string | null>(null);
  const [openedItems, setOpenedItems] = useState<Set<number>>(() => new Set());
  const interactiveRef = useRef<InteractiveHandle | null>(null);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    setSelectedPrediction(null);
    setRevealed(isSolved);
    setFailureText(null);
    setOpenedItems(new Set());
    startTimeRef.current = Date.now();
  }, [challenge.id]);

  useEffect(() => {
    if (isSolved) setRevealed(true);
  }, [isSolved]);

  const emitChallengeEvent = (
    challengeEvent: Parameters<PilotTracker["trackChallengeEvent"]>[0]["challengeEvent"],
    extra: Partial<Parameters<PilotTracker["trackChallengeEvent"]>[0]> = {}
  ) => {
    if (!challenge.telemetry.events.includes(challengeEvent)) return;
    pilotTracker?.trackChallengeEvent({
      stepIndex,
      challengeId: challenge.id,
      challengeEvent,
      ...extra
    });
  };

  const finishChallenge = () => {
    setRevealed(true);
    setFailureText(null);
    emitChallengeEvent("solved");
    emitChallengeEvent("timeOnTask", { timeOnTaskMs: Date.now() - startTimeRef.current });
    onSolved();
  };

  const handlePrediction = (optionIndex: number) => {
    const isCorrect = challenge.predict ? optionIndex === challenge.predict.correctIndex : false;
    setSelectedPrediction(optionIndex);
    emitChallengeEvent("predictChoice", { selectedIndex: optionIndex, isCorrect });

    if (challenge.type === "predict") {
      setRevealed(true);
      emitChallengeEvent("revealOpened");
      finishChallenge();
    }
  };

  const handleInteractiveCommit = () => {
    if (challenge.predict && selectedPrediction === null) {
      setFailureText("Hãy chọn một dự đoán trước khi thử.");
      return;
    }

    emitChallengeEvent("attempt");
    const result = interactiveRef.current?.commit();
    if (!result) return;

    if (result.solved) {
      finishChallenge();
      return;
    }

    const text =
      (result.failureMode ? challenge.feedback?.byMode?.[result.failureMode] : undefined) ??
      challenge.feedback?.onWrong ??
      "Chưa đúng, thử điều chỉnh lại.";
    setFailureText(text);
    emitChallengeEvent("wrongOption", {
      failureMode: result.failureMode,
      state: result.state
    });
  };

  const handleExploreToggle = (index: number) => {
    emitChallengeEvent("attempt");
    setOpenedItems((current) => {
      const next = new Set(current);
      next.add(index);
      if (
        challenge.successCriteria.kind === "exploreCount" &&
        next.size >= challenge.successCriteria.min &&
        !isSolved
      ) {
        setTimeout(finishChallenge, 0);
      }
      return next;
    });
  };

  const handleQuizCompleted = (mainScore: number, mainQuestionCount: number) => {
    pilotTracker?.trackQuizCompleted(mainScore, mainQuestionCount);
    finishChallenge();
  };

  const Interactive = challenge.interactive ? getInteractive(challenge.interactive.id) : null;
  const canAttemptInteractive = !challenge.predict || selectedPrediction !== null;

  return (
    <section className="challenge-panel" aria-label="Nhiệm vụ">
      <div className="challenge-prompt">
        <span>Nhiệm vụ</span>
        <p>{challenge.prompt}</p>
      </div>

      {challenge.predict ? (
        <PredictBlock
          disabled={challenge.type === "predict" && revealed}
          onSelect={handlePrediction}
          predict={challenge.predict}
          selectedIndex={selectedPrediction}
        />
      ) : null}

      {challenge.type === "manipulate" && Interactive && challenge.successCriteria.kind === "target" ? (
        <>
          <Interactive
            goal={challenge.successCriteria.goal}
            onChange={() => undefined}
            params={challenge.interactive?.params}
            reducedMotion={reducedMotion}
            ref={interactiveRef}
          />
          <button
            className="button button--primary challenge-action"
            disabled={!canAttemptInteractive || isSolved}
            onClick={handleInteractiveCommit}
            type="button"
          >
            Thử
          </button>
        </>
      ) : null}

      {challenge.type === "explore" && step.type === "realworld" ? (
        <ExploreBlock items={step.items} onOpen={handleExploreToggle} openedItems={openedItems} />
      ) : null}

      {challenge.type === "recall" && step.type === "quiz" ? (
        <QuizBlock
          objectives={lesson.sgkMatrix.objectives}
          onAnswer={(questionIndex, question, selectedIndex) => {
            pilotTracker?.trackQuizAnswer(questionIndex, question, selectedIndex);
            emitChallengeEvent(selectedIndex === question.answerIndex ? "attempt" : "wrongOption", {
              isCorrect: selectedIndex === question.answerIndex,
              selectedIndex
            });
          }}
          onCompleted={handleQuizCompleted}
          questions={step.questions}
        />
      ) : null}

      {selectedPrediction !== null && challenge.predict && selectedPrediction !== challenge.predict.correctIndex ? (
        <p className="feedback feedback--warning">{challenge.feedback?.onWrong ?? "Dự đoán chưa đúng, xem kết quả để sửa hiểu nhầm."}</p>
      ) : null}
      {failureText ? <p className="feedback feedback--warning">{failureText}</p> : null}
      {revealed ? <p className="challenge-explanation">{challenge.explanation}</p> : null}
    </section>
  );
}

function PredictBlock({
  disabled,
  onSelect,
  predict,
  selectedIndex
}: {
  disabled: boolean;
  onSelect: (optionIndex: number) => void;
  predict: NonNullable<Challenge["predict"]>;
  selectedIndex: number | null;
}) {
  return (
    <div className="predict-block">
      <p>{predict.prompt}</p>
      <div className="answer-grid">
        {predict.options.map((option, optionIndex) => {
          const selected = selectedIndex === optionIndex;
          const answered = selectedIndex !== null;
          const isCorrect = optionIndex === predict.correctIndex;
          return (
            <button
              className={`answer-button ${selected ? "is-selected" : ""} ${
                answered && isCorrect ? "is-correct" : ""
              } ${selected && !isCorrect ? "is-wrong" : ""}`}
              disabled={disabled}
              key={option}
              onClick={() => onSelect(optionIndex)}
              type="button"
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ExploreBlock({
  items,
  onOpen,
  openedItems
}: {
  items: { icon: string; label: string; note: string }[];
  onOpen: (index: number) => void;
  openedItems: Set<number>;
}) {
  return (
    <div className="realworld-grid">
      {items.map((item, index) => {
        const isOpen = openedItems.has(index);
        return (
          <button
            className={`mini-card explore-card ${isOpen ? "is-open" : ""}`}
            key={item.label}
            onClick={() => onOpen(index)}
            type="button"
          >
            <div className="mini-card__icon">{item.icon}</div>
            <h3>{item.label}</h3>
            <p>{isOpen ? item.note : "Chạm để mở"}</p>
          </button>
        );
      })}
    </div>
  );
}

function ReactionAnimation({
  step,
  reducedMotion
}: {
  step: Extract<Lesson["steps"][number], { type: "reaction" }>;
  reducedMotion: boolean;
}) {
  const Animation = getAnimation("combustion");
  return <Animation data={step} reducedMotion={reducedMotion} />;
}

function Facts({ facts }: { facts: string[] }) {
  return (
    <ul className="fact-list">
      {facts.map((fact) => (
        <li key={fact}>{fact}</li>
      ))}
    </ul>
  );
}

function QuizBlock({
  questions,
  objectives,
  onAnswer,
  onCompleted
}: {
  questions: QuizQuestion[];
  objectives: string[];
  onAnswer?: (questionIndex: number, question: QuizQuestion, selectedIndex: number) => void;
  onCompleted?: (mainScore: number, mainQuestionCount: number) => void;
}) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const completionTracked = useRef(false);
  const mainScore = useMemo(
    () =>
      questions.filter((question, index) => !question.isMisconceptionCheck && answers[index] === question.answerIndex)
        .length,
    [answers, questions]
  );
  const totalScore = useMemo(
    () => questions.filter((question, index) => answers[index] === question.answerIndex).length,
    [answers, questions]
  );
  const mainQuestionCount = questions.filter((question) => !question.isMisconceptionCheck).length;
  const misconceptionQuestions = questions.filter((question) => question.isMisconceptionCheck);
  const misconceptionPassed = misconceptionQuestions.every((question) => {
    const questionIndex = questions.indexOf(question);
    return answers[questionIndex] === question.answerIndex;
  });
  const answeredCount = Object.keys(answers).length;

  useEffect(() => {
    if (completionTracked.current || answeredCount !== questions.length) return;
    completionTracked.current = true;
    onCompleted?.(mainScore, mainQuestionCount);
  }, [answeredCount, mainQuestionCount, mainScore, onCompleted, questions.length]);

  const handleAnswer = (questionIndex: number, question: QuizQuestion, optionIndex: number) => {
    setAnswers((current) => ({ ...current, [questionIndex]: optionIndex }));
    onAnswer?.(questionIndex, question, optionIndex);
  };

  return (
    <div className="quiz-block">
      {questions.map((question, questionIndex) => (
        <fieldset className="quiz-question" key={question.q}>
          <legend>
            {questionIndex + 1}. {question.q}
          </legend>
          {question.mapsToObjective >= 0 ? (
            <p className="quiz-objective">{objectives[question.mapsToObjective]}</p>
          ) : (
            <p className="quiz-objective">Câu kiểm tra hiểu nhầm</p>
          )}
          <div className="answer-grid">
            {question.options.map((option, optionIndex) => {
              const selected = answers[questionIndex] === optionIndex;
              const answered = answers[questionIndex] !== undefined;
              const isCorrect = optionIndex === question.answerIndex;
              return (
                <button
                  className={`answer-button ${selected ? "is-selected" : ""} ${
                    answered && isCorrect ? "is-correct" : ""
                  } ${selected && !isCorrect ? "is-wrong" : ""}`}
                  key={option}
                  onClick={() => handleAnswer(questionIndex, question, optionIndex)}
                  type="button"
                >
                  {option}
                </button>
              );
            })}
          </div>
          {answers[questionIndex] !== undefined ? <p className="feedback">{question.feedback}</p> : null}
        </fieldset>
      ))}
      <div className="quiz-score">
        <strong>
          Bạn đúng {totalScore}/{questions.length}
        </strong>
        <span>
          Điểm quiz chính: {mainScore}/{mainQuestionCount}
        </span>
        {answeredCount === questions.length && misconceptionQuestions.length > 0 ? (
          <span>{misconceptionPassed ? "Vượt bẫy hiểu nhầm ✓" : "Cần xem lại bẫy hiểu nhầm"}</span>
        ) : null}
      </div>
    </div>
  );
}
