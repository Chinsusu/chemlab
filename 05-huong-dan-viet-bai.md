# 05 — Hướng dẫn viết bài học

> Dành cho người viết nội dung. Hướng dẫn cách viết một bài ChemLab đúng schema,
> đúng triết lý, và qua được kiểm định. Không cần biết lập trình để đọc tài liệu
> này, nhưng bài cuối cùng phải là một object `Lesson` hợp lệ (lập trình viên hỗ
> trợ chuyển sang code nếu cần).

## 1. Vòng đời một bài

```
draft  ──►  review  ──►  published
 viết      giáo viên     đã ký off,
 nháp      ký off +       validator pass,
           rà soát        lên web
```

Trạng thái nằm ở `meta.status`. **Không bao giờ để `published` nếu thiếu
`meta.reviewedBy` + `meta.reviewDate`** (validator sẽ chặn).

## 2. Năm bước bắt buộc (đúng thứ tự)

| Bước | type | Nhiệm vụ |
|------|------|----------|
| 1 | `hook` | Câu hỏi kỳ lạ + vài con số gây tò mò |
| 2 | `concept` | Khái niệm cốt lõi của trục chính |
| 3 | `concept` hoặc `reaction` | Cơ chế/phản ứng chính |
| 4 | `realworld` | Kiến thức xuất hiện ở đâu trong đời sống |
| 5 | `quiz` | Đúng 3 câu, có 1 câu kiểm tra hiểu nhầm nếu bài có phần ngoài CT |

Thứ tự này cố định — validator ép bằng tuple. Bước 5 luôn là `quiz` với đúng 3 câu.

## 3. Quy tắc vàng khi viết

### 3.1 Hook phải được chính bài trả lời
Câu hỏi mở đầu PHẢI được trả lời bằng kiến thức trong bài. Nếu câu trả lời thật
nằm ngoài bài (vd "Mặt trời lấy năng lượng từ đâu?" → nhiệt hạch, không dạy ở bài
này) thì đổi hook cho neo vào đúng kiến thức bài dạy (vd "Hydrogen trong Mặt trời
có liên quan gì đến nước?"). Hook sai sẽ khiến học sinh thấy bị "câu view".

### 3.2 Một bài một trục chính
Chỉ dạy MỘT khái niệm cốt lõi. Tối đa **3 mục tiêu cần đạt** (`objectives`).
Validator chặn nếu quá 3. Những thứ liên quan nhưng không thuộc trục chính → để
dành bài khác.

### 3.3 Nguyên tắc 80/20 (đo được)
- Mỗi bước gắn `curriculumScope`: `"core"` (kiến thức SGK) hoặc `"outOfCurriculum"`
  (phần ngoài lề gây tò mò).
- Mỗi bước gắn `estimatedMinutes` (thời lượng ước tính).
- **Tổng thời lượng phần ngoài CT ≤ 20%.** Validator tự tính và chặn nếu vượt.
- Phần "mặt trời/nhiệt hạch" là ngoài CT — chỉ để hấp dẫn, không dạy chi tiết.

### 3.4 Độ chính xác khoa học & tách bạch
Nếu hook chạm hiện tượng ngoài chương trình (vd nhiệt hạch), phải có câu **tách
bạch rõ ranh giới**: cái gì là phản ứng hạt nhân (ngoài CT), cái gì là phản ứng
hóa học (bài dạy). Xem mẫu câu trong PRD mục 4.2.

### 3.5 Chip SGK ở mỗi bước (bắt buộc)
Mỗi bước có `sgkChip`:
- Bước `core`: nhãn kiến thức SGK, vd `"Phản ứng hóa học"`.
- Bước `outOfCurriculum`: dạng `"Ngoài chương trình: nhiệt hạch"` (validator yêu
  cầu tiền tố "Ngoài chương trình").

### 3.6 An toàn (nếu có phản ứng)
Bước `reaction` PHẢI có `safetyNote`, và `meta.hasSafetyWarning = true`. Nội dung:
đây là mô phỏng, không thử ở nhà, hỗn hợp có thể nguy hiểm, thí nghiệm thật phải có
giáo viên/phòng lab. Xem PRD mục 4.6.

## 4. Điền ma trận đối chiếu SGK

Trước khi viết nội dung, điền `sgkMatrix` (PRD mục 5.1):
`grade`, `books`, `standards`, `objectives` (≤3), `prerequisites`, `outOfCurriculum`.

Đối chiếu **SGK gốc**, ghi nguồn vào `meta.sgkSources`. Lưu ý đúng cấp lớp: vd
phản ứng hydrogen + oxygen → nước thuộc KHTN 8 (khái niệm phản ứng hóa học),
KHÔNG kéo theo số oxi hóa (lớp 10).

## 5. Viết quiz

- Đúng **3 câu**. Mỗi câu `mapsToObjective` trỏ tới một mục tiêu (`-1` nếu là câu
  kiểm tra hiểu nhầm).
- `answerIndex` phải nằm trong mảng `options` (2-4 lựa chọn).
- Mỗi câu có `feedback` giải thích.
- Nếu bài có phần ngoài CT, **phải có ít nhất 1 câu `isMisconceptionCheck`** —
  câu bẫy kiểm tra học sinh không hiểu nhầm (vd "Mặt trời có cháy bằng H₂+O₂
  không?"). Câu này không tính vào điểm quiz chính.

## 6. Quy trình ký off (bắt buộc trước publish)

1. Người viết hoàn thành bản `draft`, điền đủ ma trận + metadata.
2. Ít nhất **1 giáo viên Hóa/KHTN** đối chiếu: đúng lớp, đúng bộ sách, đúng yêu
   cầu cần đạt.
3. Ghi `meta.reviewedBy` (tên giáo viên) + `meta.reviewDate` (ISO 8601).
4. Đổi `meta.status` sang `published`.
Bỏ qua bước này thì validator chặn, không lên web được.

## 7. Chạy validator

Trước khi nộp, chạy `validateLesson(lesson)` (PRD 6.2). Nó kiểm:
đúng 5 bước & thứ tự, quiz đúng 3 câu, `answerIndex`/`mapsToObjective` hợp lệ,
tỷ lệ 80/20, phản ứng cân bằng (qua `atomCounts`), có `safetyNote` khi cần, có
câu kiểm tra hiểu nhầm khi có phần ngoài CT, và không publish khi thiếu ký off.
Validator trả mảng lỗi — phải rỗng mới được merge.

## 8. Ví dụ tham chiếu — bài mẫu MVP

Bài "Phản ứng hóa học tạo nước" (hook: "Hydrogen trong Mặt trời có liên quan gì
đến nước?") là bài mẫu chuẩn. Tóm tắt cấu trúc:

- **Hook** (`outOfCurriculum`, chip "Ngoài chương trình: Mặt trời & nhiệt hạch"):
  Mặt trời, % hydrogen vũ trụ → gợi tò mò. Câu tách bạch: nhiệt hạch ≠ hóa học.
- **Concept** (`core`, chip "Phản ứng hóa học"): chất tham gia → sản phẩm là gì.
- **Reaction** (`core`, chip "Phương trình hóa học", có `safetyNote`):
  2H₂ + O₂ → 2H₂O, dữ liệu `reactants`/`products`/`atomCounts` cân bằng.
- **Realworld** (`core`): nước quanh ta, vai trò của phản ứng tạo nước.
- **Quiz** (`core`): Câu 1 chất tham gia/sản phẩm; Câu 2 viết PTHH; Câu 3
  `isMisconceptionCheck` — "Mặt trời có cháy bằng H₂+O₂ không?".

Mục tiêu cần đạt (3): (1) phản ứng hóa học là biến đổi chất tham gia thành sản
phẩm; (2) xác định chất tham gia/sản phẩm; (3) viết & đọc PTHH 2H₂ + O₂ → 2H₂O.

Xem chi tiết ma trận trong PRD mục 5.2.
