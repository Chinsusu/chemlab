# 01 — Thiết kế hệ thống (Kiến trúc)

> Kiến trúc kỹ thuật cho ChemLab Web học tập (Sản phẩm 1). App phòng thí nghiệm
> (Sản phẩm 2) tách riêng, không nằm trong tài liệu này.

## 1. Nguyên tắc kiến trúc

- **Data-driven:** một bài học là một object `Lesson` (xem PRD mục 6). Thêm bài
  mới = thêm dữ liệu, không sửa code render.
- **Registry động:** animation/tương tác là các component đăng ký sẵn, tra cứu
  qua `AnimationId` / `InteractiveId`. Bài học chỉ tham chiếu id.
- **Validation là cổng:** dữ liệu bài phải qua Zod schema + content validator
  (PRD mục 6.2) trước khi vào app và trong CI.
- **Tách nội dung khỏi trình bày:** nội dung (JSON/TS) độc lập với component UI.
- **Mobile-first, tải nhẹ:** Canvas API cho animation; KHÔNG dùng Three.js/3D ở
  web học tập (để dành app lab).

## 2. Tech stack

| Lớp | Công nghệ | Ghi chú |
|-----|-----------|---------|
| Ngôn ngữ | TypeScript (strict) | Bắt buộc strict mode |
| UI | React 18 | Functional components + hooks |
| Build | Vite | Dev server nhanh, build ESM |
| Styling | Tailwind CSS | Theo design tokens (doc 02) |
| Animation | Framer Motion | Chuyển cảnh, micro-interaction |
| Mô phỏng | Canvas API | Vẽ nguyên tử, phản ứng (2D) |
| Validation | Zod | Nguồn sự thật cho shape dữ liệu |
| Routing | React Router | SPA, lazy-load theo route |
| Lưu trữ + auth | localStorage → Supabase | MVP localStorage; Supabase cho tài khoản/tiến độ |
| Backend (khi cần) | Pages Functions / Workers (TS) | Logic riêng, giấu API key; xem mục 9 |
| Test | Vitest + React Testing Library | Unit + component |
| Deploy web | Cloudflare Pages | Static trên CDN toàn cầu; xem mục 9 + ADR-0002 |

## 3. Cấu trúc thư mục

```
chemlab-web/
├── public/                 # asset tĩnh (favicon, og-image)
├── src/
│   ├── main.tsx            # entry, mount React
│   ├── App.tsx             # router gốc
│   ├── routes/             # mỗi route 1 file (lazy-loaded)
│   │   ├── HomeRoute.tsx        # lưới câu hỏi (trang chủ)
│   │   ├── LessonRoute.tsx      # khung học 5 bước
│   │   ├── TopicRoute.tsx       # lọc theo chủ đề
│   │   ├── ProgressRoute.tsx    # tiến độ / bản đồ kiến thức
│   │   └── AboutRoute.tsx
│   ├── lessons/            # NỘI DUNG — dữ liệu bài học (data-driven)
│   │   ├── schema.ts           # Zod schema + type Lesson (PRD 6.1, 6.2)
│   │   ├── validate.ts         # content validator (PRD 6.2)
│   │   ├── index.ts            # đăng ký + load tất cả bài
│   │   └── data/
│   │       └── phan-ung-tao-nuoc.ts   # bài mẫu MVP
│   ├── animations/        # REGISTRY animation (xem doc 06)
│   │   ├── registry.ts         # map AnimationId/InteractiveId → component
│   │   ├── SunAnimation.tsx
│   │   ├── HAtomAnimation.tsx
│   │   └── CombustionAnimation.tsx
│   ├── components/        # component UI tái dùng (xem doc 02)
│   │   ├── lesson/             # Stepper, QuizBlock, SgkChip, SafetyNote...
│   │   ├── home/              # QuestionCard, TopicFilter, SearchBar...
│   │   └── ui/                # Button, Card, Badge, Chip... (primitive)
│   ├── hooks/             # useProgress, useLesson, usePrefersReducedMotion...
│   ├── lib/               # tiện ích thuần (storage, format, chemistry)
│   ├── styles/            # tokens.css, globals.css (Tailwind layer)
│   └── types/             # type dùng chung
├── tests/                 # test e2e/integration nếu cần
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
└── package.json
```

Quy ước quan trọng: **`src/lessons/data/` chỉ chứa dữ liệu**, không chứa JSX.
**`src/animations/` chỉ chứa component hiệu ứng**, không chứa nội dung bài.

## 4. Luồng dữ liệu — vòng đời một bài học

```
Người viết nội dung
   │  viết file dữ liệu Lesson (TS object)
   ▼
src/lessons/data/*.ts ──► validate.ts (Zod + content validator)
   │                          │ fail → CI chặn merge / app báo lỗi dev
   │                          ▼ pass
   ▼                       lessons/index.ts (đăng ký)
LessonRoute (đọc :id)
   │  lấy Lesson theo id
   ▼
LessonRenderer
   │  duyệt steps[] đúng thứ tự (hook→concept→…→quiz)
   │  với mỗi step có animation/interactive:
   │      registry.get(animationId) → component
   ▼
UI: Stepper + StepView + SgkChip + SafetyNote + QuizBlock
   │  hành vi học sinh (hoàn thành bước, trả lời quiz, bấm "bài tiếp")
   ▼
useProgress → localStorage (MVP) → Supabase (sau)
```

## 5. Pipeline render bài học

`LessonRenderer` nhận một `Lesson` và render tuần tự 5 bước. Mỗi loại bước
(`hook`, `concept`, `reaction`, `realworld`, `quiz`) có một `StepView` riêng. Bước
nào khai báo `animation`/`interactive` thì `StepView` tra registry để lấy component
và truyền dữ liệu bước vào.

Quy tắc:
- Thứ tự bước đã được Zod ép bằng tuple (PRD 6.2) → renderer tin tưởng thứ tự.
- Mỗi bước hiển thị `SgkChip` (bắt buộc). Bước `curriculumScope: "outOfCurriculum"`
  hiển thị chip dạng "Ngoài chương trình: …".
- Bước `reaction` luôn render `SafetyNote` từ `safetyNote`.
- Bước cuối luôn là `quiz` với đúng 3 câu; câu `isMisconceptionCheck` được đánh
  dấu để phân tích riêng (không tính vào điểm quiz chính).

## 6. Quản lý trạng thái

- **Trạng thái trong bài** (bước hiện tại, đáp án đã chọn): React state cục bộ
  trong `LessonRoute`. Không cần thư viện state toàn cục cho MVP.
- **Tiến độ học** (bài đã hoàn thành, bài đã mở khóa): hook `useProgress` đọc/ghi
  `localStorage` qua `lib/storage.ts`. Khi lên tài khoản, đổi backend sang Supabase
  mà không đổi giao diện hook.
- **KHÔNG dùng** `localStorage`/`sessionStorage` rải rác trong component — mọi truy
  cập đi qua `lib/storage.ts` để dễ thay backend.

## 7. Cơ chế mở khóa (unlock)

Mỗi `Lesson` có `difficulty` và `prerequisites` (id bài cần học trước). `useProgress`
tính tập bài đã hoàn thành; một bài "mở khóa" khi mọi prerequisite đã hoàn thành.
Trang chủ hiển thị bài khóa ở trạng thái "locked" (mờ, không bấm được). MVP có thể
để tất cả mở sẵn và chỉ bật unlock ở giai đoạn 2.

## 8. Routing & code-splitting

- SPA với React Router. Mỗi route `lazy()`-load để giảm bundle ban đầu.
- Animation component cũng nên lazy-load theo bài (chỉ tải hiệu ứng bài đang mở).
- Route placeholder `/lab/:id` tồn tại nhưng chỉ render màn hình "Sắp ra mắt" cho
  nút "Mở phòng thí nghiệm" — chưa gắn engine.

## 9. Build, deploy & hạ tầng

Quyết định và lý do đầy đủ ở `adr/0001` (chọn stack) và `adr/0002` (chọn hạ tầng
deploy). Tóm tắt vận hành:

### 9.1 Mục tiêu deploy theo nền tảng

ChemLab dùng chung `packages/core` (TypeScript), mỗi bề mặt deploy một kiểu:

| Bề mặt | Deploy tới | Ghi chú |
|--------|-----------|---------|
| Web (React + Vite) | **Cloudflare Pages** | Build static → CDN toàn cầu |
| Tài khoản / tiến độ / auth | **Supabase** | Web gọi thẳng từ client (MVP) |
| Logic riêng (giấu key, AI, webhook) | **Pages Functions / Workers** | Viết TS, cùng repo; thêm khi cần |
| Mobile (React Native, sau này) | App Store / Google Play | Qua Expo EAS; không thuộc MVP |

### 9.2 MVP — đơn giản nhất

> **MVP = Cloudflare Pages (web tĩnh) + Supabase (auth/DB). Không cần server
> riêng, không cần Workers.** Deploy một phát là xong.

- `vite build` → thư mục `dist/` → Cloudflare Pages phục vụ trên CDN. Tự lo HTTPS,
  băng thông không giới hạn, miễn phí ở mức của dự án.
- Nội dung bài học là dữ liệu tĩnh trong bundle, không gọi server mỗi lần học.
- Supabase free đủ cho giai đoạn đầu (kiểm tra 06/2026: 500 MB database, 50.000
  MAU, 1 GB storage, 5 GB băng thông, 2 project, API không giới hạn). Tiến độ học
  là dữ liệu rất nhẹ.

### 9.3 Hai lưu ý vận hành của Supabase free (phải biết trước)

- **Project tạm dừng sau 7 ngày không có query** (mất ~30s khởi động lại, dữ liệu
  không mất). Vá: cấu hình uptime ping (vd Uptime Robot) trỏ vào URL project, ping
  mỗi 5 phút để giữ sống. Hoặc lên Pro ($25/tháng) để bỏ hẳn tạm dừng.
- **Không có backup tự động.** Vá: tự backup bằng GitHub Actions + Cloudflare R2.

### 9.4 Đường nâng cấp (khi cần)

1. **Cần logic phía server** (giấu API key cho gia sư AI, webhook, xử lý nhạy
   cảm): thêm **Pages Functions / Workers** viết TypeScript, cùng repo, dùng chung
   `packages/core`. Lưu ý: Cloudflare chạy runtime Workers (V8), KHÔNG phải Node
   đầy đủ — viết theo Web API, dùng `nodejs_compat` khi cần. Với Supabase ở edge,
   gọi qua REST/HTTP client thay vì giữ kết nối Postgres trực tiếp.
2. **Cần Node đầy đủ** (thư viện kén runtime): tách backend Fastify sang
   Railway/Fly.io/Render, web vẫn ở Cloudflare Pages.
3. **Supabase free → Pro** ($25/tháng): khi có người dùng thật cần online 24/7,
   hết tạm dừng + có backup hằng ngày.

Cả ba bước đều giữ nguyên TypeScript xuyên suốt.

### 9.5 Biến môi trường & CI

- Biến môi trường (Supabase URL/key, key AI) đặt trong dashboard Cloudflare/
  Supabase, KHÔNG commit vào repo.
- CI chạy: typecheck → lint → validate toàn bộ bài → test → build (xem doc 07).
  Cloudflare Pages tự build từ nhánh khi đẩy code.

## 10. Ranh giới với App phòng thí nghiệm (Sản phẩm 2)

- Web học tập KHÔNG chứa engine phản ứng, KHÔNG Three.js, KHÔNG `molecule-3d`.
- Điểm tích hợp duy nhất ở MVP: nút "Mở phòng thí nghiệm" (placeholder).
- Khi làm app lab, đồng bộ tiến độ qua cùng backend (Supabase), không nhúng trực
  tiếp engine nặng vào bundle web.
