# 02 — Design System

> Bản sắc thị giác của ChemLab. Mọi màu, font, khoảng cách, component đều phải
> dẫn xuất từ tài liệu này. Mục tiêu: một sản phẩm học hóa học cảm giác hiện đại,
> tập trung, hợp với học sinh Việt Nam dùng điện thoại — không giống template
> edu-app phổ thông.

## 1. Định hướng thiết kế

ChemLab nói về **sự biến đổi**: một câu hỏi biến thành hiểu biết, chất tham gia
biến thành sản phẩm, năng lượng biến thành vật chất. Bản sắc thị giác lấy chính
ý đó làm gốc:

- **Hai cực năng lượng và vật chất.** Một sắc ấm (năng lượng, tia sáng, phản ứng
  — cũng là cái hook "Mặt trời") và một sắc mát (nước, sản phẩm, "đáp án"). Mọi
  bài học là hành trình từ ấm sang mát.
- **Mũi tên phản ứng `→` là motif cấu trúc.** Dấu "biến đổi thành" xuất hiện nhất
  quán: trong phương trình, giữa các bước, ở nút "bài tiếp theo". Nó mã hóa đúng
  thứ đang diễn ra (phản ứng, và việc học).
- **Tĩnh lặng, tập trung.** Nền sạch, nhiều khoảng thở. Màu rực chỉ dành cho điểm
  nhấn và khoảnh khắc "phản ứng". Học trên điện thoại cần ít nhiễu.

Đây là **chữ ký** của sản phẩm: tiết chế ở mọi nơi, dồn sự rực rỡ vào đúng khoảnh
khắc phản ứng xảy ra.

## 2. Bảng màu

Định nghĩa bằng CSS custom properties trong `src/styles/tokens.css`, map vào
Tailwind theme. **Bắt buộc hỗ trợ cả light và dark.**

### Sắc lõi (brand)

| Token | Hex | Vai trò |
|-------|-----|---------|
| `--energy-500` | `#F4A024` | Sắc ấm chủ đạo — năng lượng, hook, điểm nhấn chính |
| `--energy-600` | `#D9821A` | Energy đậm (hover, viền) |
| `--energy-100` | `#FCE9CC` | Energy nhạt (nền pill, highlight) |
| `--aqua-500` | `#16B59B` | Sắc mát chủ đạo — nước, sản phẩm, "đáp án đúng" |
| `--aqua-600` | `#0E8E7C` | Aqua đậm |
| `--aqua-100` | `#CDEFE9` | Aqua nhạt |

### Nền & chữ (auto đổi theo mode)

| Token | Light | Dark | Vai trò |
|-------|-------|------|---------|
| `--bg` | `#F7F5F0` | `#0E1116` | Nền trang |
| `--surface` | `#FFFFFF` | `#171B22` | Thẻ, panel |
| `--surface-2` | `#F1EEE7` | `#1F242D` | Nền phụ, ô nhập |
| `--text` | `#1A1D23` | `#ECEAE3` | Chữ chính |
| `--text-muted` | `#5C5F66` | `#9A9DA4` | Chữ phụ, chú thích |
| `--border` | `#E4E0D8` | `#2A2F38` | Viền mảnh |

### Màu chủ đề (lưới câu hỏi)

Mỗi nhóm chủ đề một sắc, dùng tiết chế (chỉ ở chip/viền thẻ câu hỏi, không tô nền
lớn). Giữ ≤ 6 sắc:

| Chủ đề | Token | Hex |
|--------|-------|-----|
| Nổ & lửa | `--topic-fire` | `#E2562F` |
| Sự sống | `--topic-life` | `#5DA130` |
| Năng lượng | `--topic-energy` | `#E0922A` |
| Vũ trụ | `--topic-cosmos` | `#6A5BD6` |
| Vật chất | `--topic-matter` | `#2D7FC4` |
| Đời thường | `--topic-daily` | `#1A9E86` |

### Màu ngữ nghĩa

| Token | Hex | Vai trò |
|-------|-----|---------|
| `--success` | `#16B59B` | Đúng (trùng aqua — "đáp án đúng") |
| `--danger` | `#D8493C` | Sai, cảnh báo nguy hiểm |
| `--warning` | `#E0922A` | Lưu ý (an toàn thí nghiệm) |

**Quy tắc chữ trên nền màu:** chữ luôn dùng tông đậm nhất cùng họ màu, không dùng
đen/xám thuần trên nền có màu.

## 3. Typography

**Chữ ký typographic của ChemLab là chọn font cho chính người đọc của nó.**

| Vai trò | Font | Lý do |
|---------|------|-------|
| Display / Heading | **Be Vietnam Pro** | Typeface thiết kế riêng cho tiếng Việt — dấu phụ chuẩn, có weight đậm cho tiêu đề. Đúng đối tượng. |
| Body | **Inter** | Hỗ trợ tiếng Việt tốt, dễ đọc ở cỡ nhỏ trên mobile |
| Mono / Công thức | **JetBrains Mono** | Cho mã, số liệu, và nền của công thức hóa học |

Tải qua Google Fonts (cả ba đều có trên Google Fonts). Subset `latin` +
`vietnamese`.

### Thang cỡ chữ (mobile-first)

| Cấp | Cỡ (mobile) | Cỡ (≥768px) | Weight | Dùng cho |
|-----|-------------|-------------|--------|----------|
| Display | 28px | 36px | 700 | Câu hỏi hook |
| H1 | 22px | 28px | 600 | Tiêu đề bước |
| H2 | 18px | 20px | 600 | Tiêu đề phụ |
| Body | 16px | 16px | 400 | Nội dung chính |
| Small | 14px | 14px | 400 | Chú thích, chip |
| Caption | 12px | 12px | 500 | Nhãn nhỏ, metadata |

`line-height` body = 1.6. Không dùng cỡ chữ < 12px. Tránh weight 500/600 lẫn lộn
— chỉ dùng 400 (thường), 600 (đậm vừa), 700 (display).

### Công thức hóa học

Công thức (vd 2H₂ + O₂ → 2H₂O) render bằng component `<Formula>` riêng:
- Chỉ số dưới (subscript) dùng `<sub>` thật, KHÔNG dùng ký tự Unicode rời rạc.
- Hệ số và mũi tên `→` canh giữa, dùng JetBrains Mono cho phần số.
- Lấy dữ liệu từ `reactants`/`products`/`coefficient` (PRD 6.1), không hardcode
  chuỗi — để tái dùng và kiểm tra cân bằng.

## 4. Khoảng cách & lưới

- Đơn vị cơ sở: **4px**. Mọi khoảng cách là bội số của 4 (4, 8, 12, 16, 24, 32, 48).
- Lề trang trên mobile: 16px hai bên.
- Khoảng cách dọc giữa khối: 24px; trong khối: 12-16px.
- Breakpoint: `sm` 640px, `md` 768px, `lg` 1024px. Thiết kế mobile trước, mở rộng
  lên — không thu nhỏ desktop xuống.
- Vùng nội dung tối đa: 680px (đọc thoải mái, căn giữa trên màn lớn).

## 5. Bo góc & độ nổi

- Bo góc: `--radius` 12px cho thẻ, 8px cho nút/ô nhập, pill = bo tròn hoàn toàn.
- **Phẳng, không gradient trang trí, không đổ bóng nặng.** Dùng viền mảnh 1px
  (`--border`) để phân tách. Bóng chỉ dùng rất nhẹ cho phần tử nổi (modal, popover).
- Một sắc nhấn cho mỗi màn — không rải màu rực khắp nơi.

## 6. Thư viện component

### Primitive (`components/ui/`)

- **Button** — 3 biến thể: `primary` (nền energy, chữ đậm), `secondary` (viền,
  nền trong suốt), `ghost` (chỉ chữ). Nút hành động chính mỗi màn chỉ một cái.
  Nút "bài tiếp theo" kèm mũi tên `→`.
- **Card** — nền `--surface`, viền 1px, bo 12px, padding 16px.
- **Chip** — pill nhỏ; biến thể `sgk` (nhãn kiến thức SGK) và `out` (ngoài chương
  trình, sắc muted). Đây là `SgkChip` ở mỗi bước.
- **Badge** — nhãn trạng thái/độ khó (Dễ/Vừa/Khó).

### Bài học (`components/lesson/`)

- **Stepper** — thanh tiến độ 5 bước (1→5), chấm tròn + đường nối; bước xong tô
  aqua, bước hiện energy. Cho phép quay lại bước trước.
- **StepView** — khung một bước; render nội dung + animation (qua registry) +
  `SgkChip`.
- **SafetyNote** — khối cảnh báo an toàn (nền warning nhạt, icon ⚠), bắt buộc ở
  bước `reaction`. Nội dung từ `safetyNote`.
- **QuizBlock** — 3 câu; mỗi đáp án là nút lớn (touch-friendly ≥ 44px). Đúng tô
  aqua, sai tô danger, kèm `feedback`. Câu kiểm tra hiểu nhầm xử lý/đếm riêng.
- **Formula** — render công thức hóa học (xem mục 3).

### Trang chủ (`components/home/`)

- **QuestionCard** — thẻ một câu hỏi; tiêu đề câu hỏi (Display nhỏ), gợi ý kiến
  thức, chip chủ đề, độ khó. Trạng thái `locked` khi chưa mở khóa.
- **TopicFilter** — hàng pill lọc chủ đề.
- **SearchBar** — ô tìm câu hỏi.

## 7. Motion

Dùng Framer Motion, tiết chế, phục vụ ý nghĩa "biến đổi":

- **Chuyển bước:** trượt/mờ nhẹ (200-250ms, ease-out). Mũi tên `→` là motif.
- **Phản ứng:** khi bước `reaction` chạy, animation cháy/tạo nước trên Canvas —
  đây là khoảnh khắc rực rỡ duy nhất, được phép nổi bật.
- **Micro-interaction:** nút nhấn scale 0.98; đáp án đúng có pulse aqua nhẹ.
- **Tôn trọng `prefers-reduced-motion`:** mọi animation phải tắt/giảm khi người
  dùng bật giảm chuyển động. Dùng hook `usePrefersReducedMotion`.
- Không animation chỉ để "cho đẹp" — mỗi chuyển động phải phục vụ hiểu biết.

## 8. Khả năng tiếp cận (Accessibility)

Sàn chất lượng bắt buộc, không phải tùy chọn:

- **Tương phản:** chữ trên nền đạt WCAG AA (≥ 4.5:1 cho body).
- **Vùng chạm:** mọi nút/đáp án ≥ 44×44px (mobile).
- **Bàn phím:** focus thấy rõ (viền focus 2px aqua), tab theo thứ tự hợp lý.
- **Screen reader:** ảnh/animation có nhãn mô tả; quiz dùng semantic button.
- **Giảm chuyển động:** tôn trọng `prefers-reduced-motion` (mục 7).
- **Cỡ chữ:** không khóa zoom; layout co giãn khi tăng cỡ chữ hệ thống.

## 9. Dark mode

- Bắt buộc. Mọi token màu có cặp light/dark (mục 2).
- Dùng `class="dark"` trên `<html>` + media query làm mặc định theo hệ thống.
- Cảnh cháy/phản ứng trên Canvas dùng màu vật lý cố định (không đảo theo mode) —
  lửa luôn ấm, nước luôn mát; phần nền tối luôn tối.
- Kiểm thử mọi màn ở cả hai mode trước khi merge.
