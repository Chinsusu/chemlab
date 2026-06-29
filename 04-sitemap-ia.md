# 04 — Sitemap & Kiến trúc thông tin (IA)

> Bản đồ trang, route, điều hướng và luồng người dùng của ChemLab Web học tập.

## 1. Sitemap

```
/                       Trang chủ — lưới câu hỏi (cửa vào chính)
├── /topic/:tag         Lọc câu hỏi theo chủ đề (nổ & lửa, sự sống, …)
├── /lesson/:id         Khung học một bài (5 bước stepper)
│   └── (trong bài) nút "Mở phòng thí nghiệm" → /lab/:id
├── /lab/:id            Placeholder "Sắp ra mắt" (App lab — Sản phẩm 2)
├── /progress           Tiến độ học / bản đồ kiến thức
└── /about              Giới thiệu, cách hoạt động, đối chiếu SGK
```

MVP có thể chỉ cần `/`, `/lesson/:id`, `/about` + placeholder `/lab/:id`.
`/topic/:tag` và `/progress` là của giai đoạn 2-3.

## 2. Mô tả từng trang

### `/` — Trang chủ (lưới câu hỏi)
Cửa vào theo triết lý question-first. KHÔNG phải danh sách "Bài 1, Bài 2". Gồm:
- Thanh tìm kiếm câu hỏi + hàng lọc chủ đề (TopicFilter).
- Lưới `QuestionCard`: mỗi thẻ là một câu hỏi từ đời thực, kèm gợi ý kiến thức,
  chip chủ đề, độ khó. Bài chưa mở khóa hiển thị mờ.
- Mục tiêu: trong vài giây người học thấy một câu hỏi muốn bấm vào.

### `/lesson/:id` — Khung học
Trái tim sản phẩm. Render `Lesson` theo schema:
- Stepper 5 bước (Hook → Khái niệm → Cơ chế/phản ứng → Thực tế → Quiz).
- Mỗi bước: nội dung + animation (qua registry) + `SgkChip`.
- Bước phản ứng có `SafetyNote`.
- Kết bài: quiz 3 câu + khoảnh khắc "aha" + nút "Học bài tiếp theo →".

### `/topic/:tag` — Lọc theo chủ đề
Cùng lưới câu hỏi nhưng đã lọc theo một chủ đề. Dùng lại component trang chủ.

### `/progress` — Tiến độ
Bản đồ kiến thức: bài đã học, đang mở, còn khóa. Liên hệ ma trận SGK để học sinh/
phụ huynh thấy đã phủ phần nào chương trình. (Giai đoạn 3.)

### `/lab/:id` — Placeholder phòng thí nghiệm
Màn hình "Sắp ra mắt" cho nút "Mở phòng thí nghiệm". Chưa gắn engine. Tồn tại để
luồng điều hướng hoàn chỉnh từ MVP.

### `/about` — Giới thiệu
Cách ChemLab hoạt động, triết lý question-first, cam kết bám SGK (có giáo viên ký
off). Trấn an phụ huynh/giáo viên.

## 3. Mô hình điều hướng

- **Mobile:** thanh điều hướng dưới (bottom nav) với 3 mục chính: Khám phá (/),
  Tiến độ (/progress), Giới thiệu (/about). Trong bài học, ẩn bottom nav để tập
  trung, thay bằng nút thoát + stepper.
- **Desktop:** header gọn trên cùng, nội dung căn giữa tối đa 680px.
- Quy ước: nhãn điều hướng theo cái người dùng làm ("Khám phá", "Tiến độ"), không
  theo thuật ngữ kỹ thuật.

## 4. Luồng người dùng chính

```
Trang chủ (/)
   │  thấy câu hỏi tò mò → bấm thẻ
   ▼
Bài học (/lesson/:id)
   │  Bước 1 Hook: câu hỏi + con số gây tò mò
   │  Bước 2 Khái niệm cốt lõi
   │  Bước 3 Cơ chế/phản ứng (+ cảnh báo an toàn nếu có)
   │  Bước 4 Kết nối thực tế
   │  Bước 5 Quiz 3 câu → "aha moment"
   ▼
Nút "Học bài tiếp theo →"
   │  (đo "ý định học tiếp" — PRD 9.2)
   ▼
Bài tiếp theo  hoặc  về Trang chủ
```

Luồng phụ: trong bài, bấm "Mở phòng thí nghiệm" → `/lab/:id` (placeholder) → quay
lại bài.

## 5. Cơ chế mở khóa (IA)

- Trang chủ phản ánh trạng thái unlock từ `useProgress` (doc 01 mục 7).
- Bài khóa: hiển thị nhưng mờ + nhãn "Hoàn thành [bài prerequisite] để mở".
- Tạo cảm giác tiến độ mà không ép buộc; MVP có thể mở tất cả.

## 6. URL & slug

- `:id` của bài là slug kebab-case, trùng `Lesson.id` (vd
  `/lesson/phan-ung-tao-nuoc`). Dễ đọc, ổn định, không đổi sau khi publish.
- Chủ đề `:tag` trùng giá trị trong `topicTags` (vd `/topic/nang-luong`).
