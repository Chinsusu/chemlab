import { Link, Navigate, Route, Routes, useParams } from "react-router-dom";

import { LessonRenderer } from "@/components/lesson/LessonRenderer";
import { lessons } from "@/lessons";

function HomeRoute() {
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
            </div>
            <h2>{lesson.question}</h2>
            <p>{lesson.sgkMatrix.objectives[0]}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}

function LessonRoute() {
  const { id } = useParams();
  const lesson = lessons.find((item) => item.id === id);

  if (!lesson) return <Navigate to="/" replace />;
  return <LessonRenderer lesson={lesson} />;
}

function AboutRoute() {
  return (
    <main className="page page--narrow">
      <h1>Ve ChemLab</h1>
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
      <h1>Phong thi nghiem</h1>
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
          <Link to="/about">Giới thiệu</Link>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/lesson/:id" element={<LessonRoute />} />
        <Route path="/lab/:id" element={<LabRoute />} />
        <Route path="/about" element={<AboutRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
