import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import { getAnimation } from "@/animations/registry";
import { Formula } from "@/components/lesson/Formula";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import type { Lesson, QuizQuestion } from "@/lessons/schema";

interface LessonRendererProps {
  lesson: Lesson;
}

export function LessonRenderer({ lesson }: LessonRendererProps) {
  const [activeStep, setActiveStep] = useState(0);
  const reducedMotion = usePrefersReducedMotion();
  const step = lesson.steps[activeStep] ?? lesson.steps[0];

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

        <Stepper activeStep={activeStep} setActiveStep={setActiveStep} />

        <motion.div
          key={activeStep}
          initial={reducedMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <StepView lesson={lesson} step={step} reducedMotion={reducedMotion} />
        </motion.div>

        <div className="lesson-actions">
          <button
            className="button button--secondary"
            disabled={activeStep === 0}
            onClick={() => setActiveStep((current) => Math.max(0, current - 1))}
            type="button"
          >
            ← Bước trước
          </button>
          {activeStep < lesson.steps.length - 1 ? (
            <button
              className="button button--primary"
              onClick={() => setActiveStep((current) => Math.min(lesson.steps.length - 1, current + 1))}
              type="button"
            >
              Bước tiếp theo →
            </button>
          ) : (
            <Link className="button button--primary" to="/">
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
  setActiveStep
}: {
  activeStep: number;
  setActiveStep: (step: number) => void;
}) {
  const labels = ["Hook", "Khái niệm", "Phản ứng", "Thực tế", "Quiz"];
  return (
    <ol className="stepper" aria-label="Tiến độ bài học">
      {labels.map((label, index) => (
        <li className={index <= activeStep ? "is-active" : ""} key={label}>
          <button type="button" onClick={() => setActiveStep(index)} aria-current={index === activeStep ? "step" : undefined}>
            <span>{index + 1}</span>
            <small>{label}</small>
          </button>
        </li>
      ))}
    </ol>
  );
}

function StepView({
  lesson,
  step,
  reducedMotion
}: {
  lesson: Lesson;
  step: Lesson["steps"][number];
  reducedMotion: boolean;
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
      {step.type === "realworld" ? <RealworldItems items={step.items} /> : null}
      {step.type === "quiz" ? <QuizBlock questions={step.questions} objectives={lesson.sgkMatrix.objectives} /> : null}
    </article>
  );
}

function ReactionAnimation({ step, reducedMotion }: { step: Extract<Lesson["steps"][number], { type: "reaction" }>; reducedMotion: boolean }) {
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

function RealworldItems({
  items
}: {
  items: { icon: string; label: string; note: string }[];
}) {
  return (
    <div className="realworld-grid">
      {items.map((item) => (
        <div className="mini-card" key={item.label}>
          <div className="mini-card__icon">{item.icon}</div>
          <h3>{item.label}</h3>
          <p>{item.note}</p>
        </div>
      ))}
    </div>
  );
}

function QuizBlock({
  questions,
  objectives
}: {
  questions: QuizQuestion[];
  objectives: string[];
}) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const score = useMemo(
    () =>
      questions.filter((question, index) => !question.isMisconceptionCheck && answers[index] === question.answerIndex)
        .length,
    [answers, questions]
  );
  const mainQuestionCount = questions.filter((question) => !question.isMisconceptionCheck).length;

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
                  onClick={() => setAnswers((current) => ({ ...current, [questionIndex]: optionIndex }))}
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
        Điểm quiz chính: {score}/{mainQuestionCount}
      </div>
    </div>
  );
}
