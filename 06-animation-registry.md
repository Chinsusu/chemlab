# 06 — Registry & Mission Rendering (Hợp đồng component)

> Cơ chế biến bài học (dữ liệu) thành mission tương tác (React) mà KHÔNG để mỗi
> bài tự chế một kiểu. Nguyên tắc: **React component chỉ là renderer cho spec**
> (Lesson + Challenge ở PRD mục 6). Component không chứa nội dung bài, không chứa
> logic "đoán → thử → mở" riêng cho từng bài.

## 1. Ba lớp, tách bạch trách nhiệm

```
Dữ liệu                Renderer (generic)            Widget (domain)
Lesson + Challenge  →  MissionRenderer            →  registry: animations
(PRD mục 6)            ChallengeRenderer              registry: interactives
                       (gating, predict, reveal,
                        telemetry, score)
```

- **Dữ liệu** (PRD): mỗi bước = nội dung + một `Challenge`. Không có JSX.
- **Renderer** (generic, viết MỘT lần): đọc `Challenge`, dựng đúng kiểu tương tác,
  xử lý dự đoán, cổng vượt, mở giải thích, ghi telemetry, tính điểm. Không biết gì
  về hóa học cụ thể.
- **Widget** (domain): component trong registry. `animations` là hiệu ứng nền (xem),
  `interactives` là widget thao tác được (mixer...). Widget *interactive* tự chứa
  logic miền (mixer biết 2:1 tạo nước) và báo kết quả ra ngoài.

Ranh giới vàng: **pedagogy ở Renderer, hóa học ở Widget, nội dung ở Dữ liệu.** Sai
chỗ nào cũng dẫn tới drift.

## 2. Hai registry

| Registry | Dùng cho | Định danh | Vai trò |
|----------|----------|-----------|---------|
| `animations` | Cảnh/vật thể nền (chỉ xem) | `AnimationId` | Minh họa: Mặt trời, nguyên tử... |
| `interactives` | Widget thao tác được | `InteractiveId` | Nhiệm vụ `manipulate`: mixer... |

`AnimationId` (MVP): `"sun"`, `"h-atom"`, `"combustion"`. Future-only:
`"molecule-3d"` (chỉ bật ở app lab giai đoạn 4 — KHÔNG đưa vào web).

`InteractiveId` (MVP/runtime): `"ratio-mixer"` (chủ lực), `"combine"`. Future-only:
`"star-slider"`, `"temp-control"` — KHÔNG đưa vào schema runtime cho tới khi có bài
cần thật.

## 3. MissionRenderer / ChallengeRenderer

`MissionRenderer` nhận một bước (`LessonStep`) và dựng:
nội dung (title, body, animation nền) + `ChallengeRenderer(step.challenge)`.

`ChallengeRenderer` đọc `challenge.type` và dựng đúng một trong bốn kiểu — đây là
toàn bộ "nhiều bài" chạy chung một renderer:

| `type` | ChallengeRenderer dựng | Cổng vượt (đọc `successCriteria`) |
|--------|------------------------|-----------------------------------|
| `predict` | Cảnh + thẻ dự đoán → mở `explanation` | `choice`: đã chọn (đoán sai vẫn mở) |
| `manipulate` | Dự đoán (nếu có) + mount widget từ `interactives` | `target`: widget báo `solved` |
| `explore` | Danh sách mục lật-để-mở | `exploreCount`: mở ≥ `min` |
| `recall` | Bộ câu hỏi + thẻ điểm (score clarity) | `answerAll`: trả lời hết |

ChallengeRenderer chịu trách nhiệm chung cho MỌI bài:
- **Dự đoán trước hành động:** nếu có `predict`, hiện thẻ đoán trước; ghi
  `predictChoice`; cho mở dù đoán sai (productive failure).
- **Cổng vượt:** chỉ cho qua mission khi đạt `successCriteria`. Với `manipulate`,
  chờ widget báo `solved`.
- **Reveal-after-action:** chỉ hiện `explanation` SAU khi đạt cổng.
- **Phản hồi sai:** với `manipulate`, lấy `feedback.byMode[failureMode]` mà widget
  trả về; với `choice/recall`, dùng `feedback`/`feedback` của câu.
- **Telemetry:** ghi đúng `telemetry.events` đã khai báo (attempt, timeOnTask...).
- **Score clarity:** với `recall`, tách điểm mục tiêu SGK với câu
  `misconceptionCheck`, hiện "3/3" rồi "Mục tiêu SGK 2/2 · Vượt bẫy ✓".

Vì tất cả đọc từ spec, thêm bài mới = thêm dữ liệu; KHÔNG sửa renderer.

## 4. Hợp đồng widget — animations (nền, chỉ xem)

```typescript
interface AnimationProps {
  data?: unknown;        // dữ liệu cảnh (tùy loại)
  reducedMotion: boolean; // BẮT BUỘC tôn trọng: true ⇒ trạng thái tĩnh có nghĩa
  width: number;          // mobile-first, vẽ theo width truyền vào
}
type AnimationComponent = React.FC<AnimationProps>;
```

## 5. Hợp đồng widget — interactives (thao tác, có domain logic)

Đây là phần then chốt để renderer ở mức generic. **Widget tự tính đúng/sai theo
`goal`, không đẩy logic hóa học lên renderer.** Widget nhận cấu hình, để học sinh
thao tác, và báo kết quả ra ngoài:

```typescript
type InteractiveState = Record<string, unknown>;   // trạng thái hiện tại (vd { H2: 2, O2: 1 })

interface InteractiveResult {
  solved: boolean;            // đã đạt goal chưa
  failureMode?: string;       // mã lỗi khi chưa đạt (vd "leftoverO2") → map sang feedback.byMode
  state: InteractiveState;    // trạng thái lúc đánh giá (để telemetry)
}

interface InteractiveHandle {
  commit(): InteractiveResult; // ChallengeRenderer gọi khi bấm hành động chính (vd "Cho phản ứng")
  reset(): void;
}

interface InteractiveProps {
  params: Record<string, unknown>;                         // từ challenge.interactive.params
  goal: Record<string, string | number | boolean>;         // từ successCriteria.goal (kind "target")
  reducedMotion: boolean;
  width: number;
  onChange?(state: InteractiveState): void;                // mỗi lần học sinh chỉnh (tùy chọn)
}
// Widget interactive expose InteractiveHandle qua ref để renderer gọi commit().
type InteractiveComponent = React.ForwardRefExoticComponent<
  InteractiveProps & React.RefAttributes<InteractiveHandle>
>;
```

Luồng một nhiệm vụ `manipulate`:
1. ChallengeRenderer mount widget với `params` + `goal`, hiện thẻ dự đoán (nếu có).
2. Học sinh chỉnh widget (widget có thể gọi `onChange`).
3. Học sinh bấm hành động chính (nút do renderer dựng, nhãn từ `challenge.prompt`/
   mặc định "Thử") → renderer gọi `handle.commit()`.
4. Widget tính theo `goal`, trả `InteractiveResult`.
5. Renderer: `solved` → mở `explanation`, mở cổng; ngược lại → hiện
   `feedback.byMode[failureMode]`, cho thử lại. Ghi telemetry mỗi bước.

Quy tắc bắt buộc cho widget interactive:
- **Tự chứa logic miền**, không nhờ renderer tính hóa học.
- **Báo `failureMode` có ý nghĩa** để feedback khớp (vd `leftoverO2` ⇒ "mỗi O₂ cần 2 H₂").
- Tôn trọng `reducedMotion`, vẽ theo `width` (mobile-first), dọn dẹp Canvas/RAF.
- Màu vật lý cố định cho cảnh phản ứng (lửa ấm, nước mát) — không đảo theo dark mode.

## 6. Registry

```typescript
// src/animations/registry.ts
const animations: Record<string, AnimationComponent> = {
  "sun": SunAnimation, "h-atom": HAtomAnimation, "combustion": CombustionAnimation,
};
export const getAnimation = (id: string) => animations[id] ?? null;

// src/interactives/registry.ts
const interactives: Record<string, InteractiveComponent> = {
  "ratio-mixer": RatioMixer,
  "combine": CombineTwo,
};
export const getInteractive = (id: string) => interactives[id] ?? null;
```

`ChallengeRenderer` gọi `getInteractive(challenge.interactive.id)` cho nhiệm vụ
`manipulate`. Nếu `null` → lỗi dev (validator đã chặn ở build, xem PRD 6.2).

## 7. Spec widget MVP

### 7.1 `ratio-mixer` (chủ lực)

- **params:** `reactants: {formula, atomCounts}[]`, `product: {formula, atomCounts}`,
  `range: {min, max}`.
- **state:** số phân tử mỗi chất, vd `{ H2: 2, O2: 1 }`.
- **goal:** `{ product: "H2O", noLeftover: true }`.
- **commit():** tính có tạo `product` mà không dư không. Với nước: cần `H2>0 && O2>0`
  và `H2 === 2*O2`. Trả:
  - đạt → `{ solved: true, state }`.
  - `H2===0 || O2===0` → `{ solved:false, failureMode:"missingReactant" }`.
  - `H2 > 2*O2` → `{ solved:false, failureMode:"leftoverH2" }`.
  - `H2 < 2*O2` → `{ solved:false, failureMode:"leftoverO2" }`.
- **UI:** khay phân tử + stepper +/- cho từng chất (vùng chạm ≥44px). Khi solved,
  hiện phân tử sản phẩm + phương trình cân bằng (dùng `atomCounts` để hiển thị hệ số).

> Lưu ý: logic cân bằng dựa trên `atomCounts` (PRD 6.1), KHÔNG parse công thức bằng
> regex. Mixer là một widget — đổi sang cơ chế khác (kéo-thả nguyên tử...) chỉ là
> thêm `InteractiveId` mới, hợp đồng Challenge không đổi.

### 7.2 `combine` (mission Khái niệm)

- **params:** `reactants: {formula}[]`, `product: {formula}`.
- **state:** tập chất đã chạm.
- **goal:** `{ product: "H2O" }`.
- **commit()/onChange:** khi đã chạm hết `reactants` → `{ solved:true }`, hiện sản
  phẩm. Không có failureMode (nhiệm vụ nhẹ).

### 7.3 Future (không thuộc MVP)

- `star-slider`, `temp-control`: cùng `InteractiveProps`/`InteractiveHandle`. Chỉ
  thêm khi có bài cần. `molecule-3d` (animations) chỉ ở app lab giai đoạn 4.

## 8. Thêm một interactive mới

1. Viết component theo `InteractiveProps` + expose `InteractiveHandle` (commit/reset);
   tự chứa logic miền, báo `failureMode` rõ ràng.
2. Thêm string vào `InteractiveId` (PRD 6.1) và Zod enum (PRD 6.2) — để bài tham
   chiếu được và validator chấp nhận.
3. Đăng ký vào `interactives/registry.ts`.
4. Lazy-load nếu nặng. Viết test: mount + một nhánh `solved` + một nhánh `failureMode`.

## 9. Canvas hay Framer Motion?

- **Canvas API:** mô phỏng "vật lý" — hạt, phản ứng cháy, mixer động. Nhẹ, hợp mobile.
- **Framer Motion:** chuyển cảnh UI, micro-interaction, reveal.
- **KHÔNG Three.js/WebGL 3D** ở web học tập — để dành app lab (tránh bundle nặng).

## 10. Hiệu năng & a11y

- Hủy `requestAnimationFrame` khi unmount; dừng khi tab ẩn.
- Giới hạn số hạt/khung hình cho điện thoại tầm trung; lazy-load widget theo bài.
- Mọi widget tôn trọng `prefers-reduced-motion`; vùng chạm ≥44px; focus thấy rõ.
- Đo trên thiết bị thật (persona dùng điện thoại), không chỉ desktop.
