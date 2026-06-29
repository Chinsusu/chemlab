import { Link, Navigate, Route, Routes, useParams } from "react-router-dom";

import { LessonRenderer } from "@/components/lesson/LessonRenderer";
import { lessons } from "@/lessons";

function HomeRoute() {
  return (
    <main className="page">
      <section className="hero">
        <div className="hero__eyebrow">ChemLab MVP</div>
        <h1>Hoc hoa hoc bang cau hoi that.</h1>
        <p>
          Bai mau dau tien dung cau hoi ve hydrogen trong Mat troi de dan vao phan ung
          hoa hoc tao nuoc, bam theo KHTN 8.
        </p>
      </section>

      <section className="question-grid" aria-label="Danh sach cau hoi">
        {lessons.map((lesson) => (
          <Link className="question-card" key={lesson.id} to={`/lesson/${lesson.id}`}>
            <div className="question-card__tags">
              {lesson.topicTags.map((tag) => (
                <span className="topic-chip" key={tag}>
                  {tag}
                </span>
              ))}
              <span className="difficulty">Do kho {lesson.difficulty}</span>
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
        ChemLab day hoa hoc theo cach question-first: moi bai bat dau bang mot cau hoi
        duoc chinh bai hoc tra loi, co chip doi chieu SGK va validator chan noi dung
        lech chuong trinh.
      </p>
      <p>
        Ban MVP nay dang tap trung vao mot bai mau lop 8: phan ung hoa hoc tao nuoc.
      </p>
      <Link className="button button--secondary" to="/">
        Quay lai kham pha
      </Link>
    </main>
  );
}

function LabRoute() {
  return (
    <main className="page page--narrow">
      <h1>Phong thi nghiem</h1>
      <p>Phan lab tuong tac se duoc tach rieng o giai doan sau.</p>
      <Link className="button button--secondary" to="/">
        Quay lai ChemLab
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
        <nav aria-label="Dieu huong chinh">
          <Link to="/">Kham pha</Link>
          <Link to="/about">Gioi thieu</Link>
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
