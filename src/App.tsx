import { Link, Navigate, Route, Routes, useParams } from "react-router-dom";

import { LessonRenderer } from "@/components/lesson/LessonRenderer";
import { useProgress } from "@/hooks/useProgress";
import { lessons } from "@/lessons";

function HomeRoute() {
  const { progress } = useProgress();

  return (
    <main className="page">
      <section className="hero">
        <div className="hero__eyebrow">ChemLab MVP</div>
        <h1>Học hóa học bằng câu hỏi thật.</h1>
        <p>
          Bài mẫu đầu tiên dùng câu hỏi về hydrogen trong Mặt trời để dẫn vào phản
          ứng hóa học tạo nước, bám theo KHTN 8.
        </p>
      </section>

      <section className="question-grid" aria-label="Danh sách câu hỏi">
        {lessons.map((lesson) => (
          <Link className="question-card" key={lesson.id} to={`/lesson/${lesson.id}`}>
            <div className="question-card__tags">
              {lesson.topicTags.map((tag) => (
                <span className="topic-chip" key={tag}>
                  {tag}
                </span>
              ))}
              <span className="difficulty">Độ khó {lesson.difficulty}</span>
              {progress.completedLessonIds.includes(lesson.id) ? (
                <span className="difficulty difficulty--done">Đã hoàn thành</span>
              ) : null}
            </div>
            <h2>{lesson.question}</h2>
            <p>{lesson.sgkMatrix.objectives[0]}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}

function ProgressRoute() {
  const { progress } = useProgress();
  const completedCount = lessons.filter((lesson) =>
    progress.completedLessonIds.includes(lesson.id)
  ).length;
  const completionPercent = Math.round((completedCount / lessons.length) * 100);

  return (
    <main className="page">
      <section className="progress-hero">
        <div>
          <div className="hero__eyebrow">Tiến độ</div>
          <h1>Tiến độ học</h1>
          <p>Theo dõi bài đã hoàn thành, bước đang học dở và lượt bấm bài tiếp theo.</p>
        </div>
        <div className="progress-meter" aria-label={`Hoàn thành ${completionPercent}%`}>
          <strong>{completionPercent}%</strong>
          <span>{completedCount}/{lessons.length} bài</span>
        </div>
      </section>

      <section className="progress-summary" aria-label="Tổng quan tiến độ">
        <div className="progress-stat">
          <span>Bài hoàn thành</span>
          <strong>{completedCount}</strong>
        </div>
        <div className="progress-stat">
          <span>Tổng bài MVP</span>
          <strong>{lessons.length}</strong>
        </div>
        <div className="progress-stat">
          <span>Lưu trên máy này</span>
          <strong>Có</strong>
        </div>
      </section>

      <section className="progress-list" aria-label="Chi tiết từng bài">
        {lessons.map((lesson) => {
          const stepIndex = progress.lessonSteps[lesson.id] ?? 0;
          const currentStep = Math.min(stepIndex + 1, lesson.steps.length);
          const isCompleted = progress.completedLessonIds.includes(lesson.id);
          const nextClicks = progress.nextLessonClicks[lesson.id] ?? 0;

          return (
            <article className="progress-row" key={lesson.id}>
              <div>
                <div className="question-card__tags">
                  <span className="topic-chip">{lesson.topicTags[0]}</span>
                  {isCompleted ? (
                    <span className="difficulty difficulty--done">Đã hoàn thành</span>
                  ) : (
                    <span className="difficulty">Đang học</span>
                  )}
                </div>
                <h2>{lesson.question}</h2>
                <p>{lesson.sgkMatrix.objectives[0]}</p>
              </div>
              <div className="progress-row__meta">
                <span>Bước {currentStep}/{lesson.steps.length}</span>
                <span>{nextClicks} lượt bấm bài tiếp theo</span>
                <Link className="button button--secondary" to={`/lesson/${lesson.id}`}>
                  Tiếp tục học
                </Link>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}

function LessonRoute() {
  const { id } = useParams();
  const lesson = lessons.find((item) => item.id === id);
  const progressApi = useProgress();

  if (!lesson) return <Navigate to="/" replace />;
  return <LessonRenderer lesson={lesson} progressApi={progressApi} />;
}

function AboutRoute() {
  return (
    <main className="page page--narrow">
      <h1>Về ChemLab</h1>
      <p>
        ChemLab dạy hóa học theo cách question-first: mỗi bài bắt đầu bằng một câu
        hỏi được chính bài học trả lời, có chip đối chiếu SGK và validator chặn nội
        dung lệch chương trình.
      </p>
      <p>
        Bản MVP này đang tập trung vào một bài mẫu lớp 8: phản ứng hóa học tạo nước.
      </p>
      <Link className="button button--secondary" to="/">
        Quay lại khám phá
      </Link>
    </main>
  );
}

function LabRoute() {
  return (
    <main className="page page--narrow">
      <h1>Phòng thí nghiệm</h1>
      <p>Phần lab tương tác sẽ được tách riêng ở giai đoạn sau.</p>
      <Link className="button button--secondary" to="/">
        Quay lại ChemLab
      </Link>
    </main>
  );
}

export function App() {
  return (
    <>
      <header className="site-header">
        <Link className="brand" to="/">
          ChemLab
        </Link>
        <nav aria-label="Điều hướng chính">
          <Link to="/">Khám phá</Link>
          <Link to="/progress">Tiến độ</Link>
          <Link to="/about">Giới thiệu</Link>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/progress" element={<ProgressRoute />} />
        <Route path="/lesson/:id" element={<LessonRoute />} />
        <Route path="/lab/:id" element={<LabRoute />} />
        <Route path="/about" element={<AboutRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
