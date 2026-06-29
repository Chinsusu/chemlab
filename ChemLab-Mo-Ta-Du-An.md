# ChemLab — Tài liệu mô tả dự án

> Website dạy hóa học theo phương pháp "câu hỏi dẫn dắt", bám sát chương trình
> SGK Việt Nam nhưng không khô khan như sách giáo khoa.

**Phiên bản tài liệu:** 1.5
**Ngày cập nhật:** 06/2026
**Trạng thái:** Định hướng sản phẩm (chưa khởi động phát triển)

**Thay đổi so với 1.4:**
- TypeScript contract ép đúng thứ tự bước: `steps` là tuple
  `[HookStep, ConceptStep, ConceptStep | ReactionStep, RealworldStep, QuizStep]`,
  khớp với Zod — mục 6.1.
- `sgkChip` chuyển thành bắt buộc (bỏ dấu `?`); bước ngoài chương trình dùng chip
  dạng "Ngoài chương trình: ..." — mục 6.1, 6.2.
- Thay parse công thức bằng regex bằng trường `atomCounts` có cấu trúc; validator
  cân bằng phản ứng đọc `atomCounts` thay vì regex — mục 6.1, 6.2.
- Ghi thẳng "15-20 học sinh lớp 8" để tránh test lẫn lớp 9-10 rồi thiếu mẫu lớp 8
  — mục 9.1.

---

## 1. Tóm tắt dự án

ChemLab là nền tảng học hóa học trực tuyến, lấy **câu hỏi từ đời thực** làm cửa
vào cho từng bài học. Thay vì mở ra thấy "Bài 1: Cấu tạo nguyên tử", người học
thấy một câu hỏi khiến họ tò mò — "Hydrogen trong Mặt trời có liên quan gì đến
nước?" — rồi hóa học xuất hiện như công cụ để trả lời câu hỏi đó.

Điểm khác biệt cốt lõi: mỗi bài học vừa thỏa mãn sự tò mò, vừa **bám sát chuẩn
kiến thức chương trình SGK** — học sinh học đúng những gì cần thi, mà không cảm
thấy đang học SGK. (Lưu ý: lời hứa "bám sát SGK" phải được kiểm chứng bằng ma trận
đối chiếu ở mục 5, có giáo viên ký off, không được tuyên bố suông.)

Dự án chia làm hai sản phẩm tách biệt:

1. **Web học tập** (làm trước) — nội dung bài giảng tương tác, animation, quiz.
2. **App phòng thí nghiệm** (mở rộng sau) — kéo-thả nguyên tử/phân tử để tạo
   phản ứng thật, mô phỏng 3D.

Tài liệu này tập trung vào **Web học tập** — sản phẩm khởi đầu.

---

## 2. Vấn đề và cơ hội

### 2.1 Vấn đề người học gặp phải

Hóa học bị xem là môn khó và khô khan vì cách dạy truyền thống nặng về liệt kê
và ghi nhớ. Học sinh đọc "H2 tác dụng với CuO ở 400°C tạo Cu và H2O" nhưng không
*thấy* điều gì xảy ra, không hiểu *tại sao* phải học, và nhanh chóng mất hứng thú.

Sách giáo khoa dạy theo trình tự logic của môn học (nguyên tử → liên kết → phản
ứng), nhưng đây không phải cách con người học tự nhiên. Người ta học khi tò mò,
khi có câu hỏi cần trả lời — không phải khi bị ép "hôm nay học bài mấy".

### 2.2 Khoảng trống thị trường

Khảo sát một số ứng dụng hóa học phổ biến cho thấy một khoảng trống rõ ràng. Bảng
so sánh dưới đây dùng tiêu chí thống nhất, có ghi nguồn và ngày kiểm tra để tránh
claim lỗi thời.

**Tiêu chí so sánh:** (1) bám chương trình Việt Nam, (2) trải nghiệm mobile,
(3) lộ trình học có cấu trúc, (4) quiz/theo dõi tiến độ, (5) chi phí.

| Sản phẩm | Bám CT Việt Nam | Mobile UX | Lộ trình học | Quiz/Tiến độ | Chi phí (kiểm tra 06/2026) |
|----------|-----------------|-----------|--------------|--------------|----------------------------|
| PhET Simulations | Không | Trung bình (đã có HTML5) | Không | Hạn chế | Miễn phí, mã nguồn mở |
| Labster | Không (theo AP/IB/NGSS) | Tốt (desktop/iPad) | Theo simulation | Có, chấm tự động | Gói Explorer 3.000 USD/năm cho 10 sim, 50 học sinh (~5 USD/HS/tháng) |
| ChemCollective | Không | Yếu (hỗ trợ cảm ứng nhưng UI cũ) | Theo bài tập | Có (auto-grade) | Miễn phí |
| Khan Academy | Không (CT Mỹ) | Tốt | Có (mastery-based) | Có | Miễn phí |

**Nguồn (kiểm tra 06/2026):**
- Labster pricing: https://www.labster.com/compare-plans (Explorer 3.000 USD/năm)
- PhET (miễn phí, mã nguồn mở, HTML5): https://phet.colorado.edu/en/about
- ChemCollective (Carnegie Mellon, miễn phí): https://chemcollective.org/
- Khan Academy Chemistry: https://www.khanacademy.org/science/hs-chemistry

**Diễn giải:** PhET không phải "UI cũ" đơn thuần — đây là bộ mô phỏng miễn phí,
mã nguồn mở, đã chuyển sang HTML5, độ chính xác khoa học cao; điểm yếu thật là
thiếu lộ trình học và gamification. Labster mạnh về đồ họa và chấm điểm nhưng đắt
và theo chương trình quốc tế. ChemCollective có engine kéo-thả tốt nhưng giao diện
cũ. **Trong nhóm sản phẩm đã khảo sát, chưa thấy sản phẩm nào kết hợp được: bám
chương trình Việt Nam + mobile tốt + lộ trình học + miễn phí.**

> **Lưu ý bảo trì:** Giá và tính năng đối thủ thay đổi theo thời gian. Cần ghi
> ngày kiểm tra mỗi lần cập nhật bảng này, không dùng số liệu cũ. Đây mới là khảo
> sát 4 sản phẩm tiêu biểu, không phải toàn thị trường.

### 2.3 Bối cảnh chương trình Việt Nam

Chương trình giáo dục phổ thông 2018 (3 bộ sách: Kết nối tri thức, Chân trời
sáng tạo, Cánh diều) **không còn bài học riêng về từng nguyên tố** như chương
trình cũ. Kiến thức được phân tán qua nhiều bài. Đây là cơ hội: ChemLab có thể
tập hợp kiến thức rời rạc thành những bài học mạch lạc, hấp dẫn, theo cách không
sách giáo khoa nào làm được.

---

## 3. Đối tượng người dùng

### 3.1 Persona chính cho MVP (khóa lại)

Đối tượng "bất kỳ ai muốn học hóa" là tầm nhìn dài hạn, nhưng **quá rộng cho
MVP**. Một học sinh lớp 8, một học sinh luyện thi THPT, một giáo viên, và một
người lớn tò mò cần độ sâu hoàn toàn khác nhau. MVP phải khóa một persona chính:

> **Persona chính (MVP):** Học sinh THCS / đầu THPT (lớp 8-10), dùng điện thoại
> là chính, có động lực học nhưng dễ chán với SGK truyền thống. Bài mẫu MVP map
> chính vào lớp 8, nên nhóm test quyết định là lớp 8 (xem mục 9.1).

Mọi quyết định thiết kế ở giai đoạn MVP ưu tiên persona này: độ sâu kiến thức,
độ khó câu hỏi, ngôn ngữ, và đặc biệt là trải nghiệm mobile.

### 3.2 Nhóm thứ cấp (phục vụ sau khi MVP ổn)

- **Học sinh THPT luyện thi** — cần độ sâu hơn, gắn với đề thi.
- **Người lớn tò mò** — học vì thích thú, không vì điểm số.

### 3.3 Bên liên quan cần thuyết phục

- **Phụ huynh** — cần đảm bảo "con học đúng chương trình", thấy được tiến độ.
- **Giáo viên** — cần công cụ minh họa trực quan, dùng song song với bài giảng.

---

## 4. Triết lý sản phẩm

### 4.1 Question-first learning (Học theo câu hỏi)

Câu hỏi tạo ra nhu cầu học, không phải ngược lại. Mỗi bài học bắt đầu bằng một
câu hỏi đủ kỳ lạ để người ta muốn click vào tìm hiểu.

**Nguyên tắc cốt lõi:** câu hỏi hook phải được **chính bài học trả lời**. Nếu
hook hỏi một đằng mà nội dung dạy một nẻo, người học sẽ thấy bị "câu view" và mất
niềm tin. Ví dụ, hook "Mặt trời lấy năng lượng từ đâu?" KHÔNG hợp lệ cho một bài
dạy phản ứng tạo nước, vì câu trả lời thật (nhiệt hạch) không nằm trong bài. Hook
đúng phải neo vào chính kiến thức bài dạy.

Ví dụ ánh xạ câu hỏi → kiến thức SGK:

| Câu hỏi cửa vào | Kiến thức SGK ẩn bên trong |
|-----------------|----------------------------|
| Hydrogen trong Mặt trời có liên quan gì đến nước? | Phản ứng hóa học tạo nước (xem mục 5.2) |
| Tại sao thuốc nổ lại nổ? | Phản ứng oxi hóa khử, enthalpy, tốc độ phản ứng |
| Vì sao sắt gỉ mà vàng thì không? | Phản ứng oxi hóa, bảng tuần hoàn, thế điện hóa |
| Tại sao nước sôi 100°C, rượu 78°C? | Liên kết hydrogen, lực liên phân tử |
| Pin lithium hoạt động thế nào? | Phản ứng oxi hóa khử, điện hóa học |
| Tại sao bể bơi có mùi clo? | Nhóm halogen, tính chất hóa học |

### 4.2 Cảnh báo độ chính xác khoa học (BẮT BUỘC)

Câu hỏi hấp dẫn rất dễ kéo người học sang kiến thức sai hoặc ngoài chương trình.
Đây là rủi ro nghiêm trọng vì nó phá hỏng chính lời hứa "bám SGK".

**Ví dụ điển hình — bài về Mặt trời và nước:** Mặt trời KHÔNG "cháy" bằng phản
ứng hóa học H2 + O2. Nó phát năng lượng bằng **phản ứng nhiệt hạch** (fusion:
4 H → He), đây là phản ứng **hạt nhân**, không phải phản ứng hóa học, và **không
có trong chương trình hóa phổ thông**.

Vì lý do này, hook không hỏi "Mặt trời lấy năng lượng từ đâu" (câu trả lời là
nhiệt hạch, ngoài chương trình và không phải thứ bài dạy), mà hỏi **"Hydrogen
trong Mặt trời có liên quan gì đến nước?"** — câu hỏi này được bài trả lời trọn
vẹn: cùng một nguyên tố hydrogen, và trên Trái Đất nó kết hợp với oxygen tạo
thành nước.

Mẫu câu tách bạch (đưa vào bài):

> "Hydrogen là nguyên tố phổ biến nhất vũ trụ và là 'nhiên liệu' của Mặt trời —
> nhưng Mặt trời sinh năng lượng bằng phản ứng nhiệt hạch (phản ứng hạt nhân,
> KHÔNG phải phản ứng hóa học). Còn trên Trái Đất, chính nguyên tố hydrogen đó
> kết hợp với oxygen tạo thành nước, và đây là một ví dụ điển hình của phản ứng
> hóa học: chất tham gia biến đổi thành chất sản phẩm. Phương trình: 2H2 + O2 →
> 2H2O."

Quy tắc chung: **hook có thể chạm tới hiện tượng ngoài chương trình để gây tò mò,
nhưng phần kiến thức chính phải đúng SGK và phải nói rõ đâu là ranh giới.** Việc
học sinh KHÔNG hiểu nhầm điểm này là một tiêu chí pass/fail của MVP (mục 9.3).

### 4.3 Nguyên tắc 80/20 cho nội dung (đo được)

- **80% thời lượng** = kiến thức đúng chương trình SGK (thi được, học được).
- **20% thời lượng** = phần "ngoài lề thú vị" để gây tò mò và kết nối thực tế.

Để nguyên tắc này không chỉ là khẩu hiệu, **mỗi bước trong bài mang nhãn
`curriculumScope` ("core" hoặc "outOfCurriculum") và `estimatedMinutes`**
(mục 6.1). Content validator (mục 6.2) tính tổng thời lượng phần ngoài chương
trình và chặn bài nếu vượt 20%. Câu hỏi là *cửa vào*, không phải toàn bộ nội dung.

### 4.4 Một bài, một trục chính (chống quá tải)

Với persona lớp 8-10 dùng điện thoại, mỗi bài **chỉ nên có một trục kiến thức
chính**. Nhồi nhiều mục tiêu vào một bài sẽ gây quá tải và làm loãng "khoảnh khắc
aha". Một bài tốt trả lời gọn một câu hỏi, dạy gọn một khái niệm cốt lõi.

### 4.5 Ba nguyên tắc UX cốt lõi

1. **Discoverability là số 1.** Mọi tool hiện tại cần xem video hướng dẫn trước
   khi dùng. ChemLab phải "zero instruction" — mở ra là biết ngay phải làm gì.
2. **Feedback tức thì và trực quan.** Khi phản ứng xảy ra phải có màu sắc, chuyển
   động, hiệu ứng — không chỉ là con số.
3. **Mobile-first.** Học sinh Việt Nam chủ yếu dùng điện thoại. Đây là lợi thế
   cạnh tranh lớn nếu làm tốt.

### 4.6 Ràng buộc an toàn thí nghiệm (BẮT BUỘC khi bài có phản ứng)

Bài học có phản ứng — đặc biệt phản ứng cháy/nổ như hydrogen + oxygen — phải hiển
thị cảnh báo an toàn rõ ràng, phù hợp với học sinh lớp 8-10:

- Đây là **mô phỏng trên máy**, KHÔNG phải hướng dẫn làm thí nghiệm thật.
- **KHÔNG tự thử ở nhà.**
- Hỗn hợp hydrogen và oxygen có thể **gây nổ**.
- Mọi thí nghiệm thật phải có **giáo viên hướng dẫn** và thực hiện trong **phòng
  thí nghiệm** có trang bị an toàn.

Cảnh báo này là một thành phần bắt buộc của bài (mục 6) và được kiểm tra trong quy
trình rà soát trước khi phát hành (mục 5.3). Bước `reaction` trong schema có
trường `safetyNote` bắt buộc (mục 6.1, 6.2).

---

## 5. Đảm bảo "đúng SGK" — Ma trận đối chiếu chương trình

Đây là phần quan trọng nhất để biến lời hứa "bám SGK" từ khẩu hiệu thành cam kết
kiểm chứng được. **Không bài nào được phát hành nếu chưa điền đủ ma trận này VÀ
chưa có giáo viên ký off.**

### 5.1 Mỗi bài học phải có một bản đối chiếu

| Trường | Mô tả |
|--------|-------|
| Lớp | Lớp áp dụng (8, 9, 10...) |
| Bộ sách | Kết nối tri thức / Chân trời sáng tạo / Cánh diều (map vào bộ nào, bài số mấy) |
| Chuẩn kiến thức | Yêu cầu cần đạt tương ứng trong Chương trình GDPT môn KHTN/Hóa 2018 |
| Mục tiêu cần đạt | Sau bài này học sinh làm được gì (động từ đo lường được: nêu, giải thích, tính, viết PTHH...) |
| Prerequisite | Kiến thức/bài học cần học trước |
| Quiz đo mục tiêu nào | Mỗi câu quiz ánh xạ tới mục tiêu cần đạt cụ thể |
| Phần ngoài CT | Ghi rõ phần nào trong bài là "ngoài lề thú vị" (20%), để minh bạch |
| Giáo viên ký off | Tên giáo viên đối chiếu + ngày (xem 5.3) |

### 5.2 Bài mẫu MVP — khóa một trục chính, gắn đúng nguồn SGK

Bản 1.2 dùng trục "Hydrogen và phản ứng với oxygen", nhưng kiểm tra lại chương
trình cho thấy điều này lệch nếu map vào lớp 8. Trong **KHTN 8 (Kết nối tri thức),
Chương 1 "Phản ứng hóa học", Bài 2 "Phản ứng hóa học"**, phản ứng hydrogen +
oxygen → nước được dùng làm **ví dụ minh họa cho khái niệm phản ứng hóa học**
(chất tham gia, chất sản phẩm), KHÔNG phải một bài riêng về tính chất hydrogen.
Lớp 8 cũng chưa học khái niệm số oxi hóa / oxi hóa khử (đó là kiến thức lớp 10).

> Nguồn đã kiểm tra (06/2026): mục lục KHTN 8 KNTT và câu hỏi trang 14, Bài 2 —
> https://vietjack.com/khoa-hoc-tu-nhien-8-kn/bai-2-phan-ung-hoa-hoc.jsp
> Lưu ý: đây là nguồn thứ cấp để định vị bài; khi viết nội dung phải đối chiếu
> SGK gốc và có giáo viên ký off.

Vì vậy trục chính được khóa cho khớp đúng vị trí trong SGK:

> **Trục chính bài mẫu MVP: "Phản ứng hóa học tạo nước"**
> Hook là "Hydrogen trong Mặt trời có liên quan gì đến nước?" — giữ yếu tố Mặt
> trời gây tò mò, nhưng câu hỏi được bài trả lời trọn vẹn (cùng nguyên tố
> hydrogen; trên Trái Đất nó kết hợp oxygen tạo nước). Toàn bộ phần kiến thức tập
> trung vào MỘT khái niệm đúng chương trình lớp 8: phản ứng hóa học, qua ví dụ
> 2H2 + O2 → 2H2O (chất tham gia biến đổi thành sản phẩm).

Ma trận đối chiếu cho bài này:

- **Lớp:** 8.
- **Bộ sách:** KHTN 8 Kết nối tri thức — Chương 1, Bài 2 "Phản ứng hóa học"
  (đối chiếu thêm Chân trời sáng tạo / Cánh diều khi viết).
- **Chuẩn kiến thức:** Nêu được khái niệm phản ứng hóa học; nêu được chất tham
  gia và chất sản phẩm; nêu được dấu hiệu nhận biết có phản ứng hóa học xảy ra.
- **Mục tiêu cần đạt (chỉ 3, không hơn):**
  1. Nêu được phản ứng hóa học là quá trình biến đổi chất tham gia thành sản phẩm.
  2. Xác định được chất tham gia (hydrogen, oxygen) và sản phẩm (nước) trong ví dụ.
  3. Viết và đọc được phương trình chữ / PTHH: 2H2 + O2 → 2H2O.
- **Prerequisite:** Khái niệm chất, nguyên tử/phân tử cơ bản.
- **Quiz đo mục tiêu:** Câu 1 → mục tiêu 2 (chất tham gia/sản phẩm); Câu 2 →
  mục tiêu 3 (PTHH); Câu 3 → kiểm tra hiểu nhầm (mặt trời có cháy bằng H2+O2 không).
- **Phần ngoài CT (20%):** Mặt trời, phản ứng nhiệt hạch, % hydrogen trong vũ trụ
  — chỉ để gây tò mò, có cảnh báo rõ đây là phản ứng hạt nhân, không phải hóa học.
  KHÔNG dạy chi tiết nhiệt hạch. Đánh nhãn `curriculumScope: "outOfCurriculum"`
  cho bước hook để validator kiểm tra tỷ lệ 80/20.

Những thứ **cố tình loại khỏi bài MVP** (để dành cho các bài sau): cấu hình
electron 1s¹, tính chất vật lý chi tiết của hydrogen, khái niệm oxi hóa khử/số
oxi hóa (lớp 10), cấu tạo nguyên tử chi tiết. Mỗi thứ này xứng đáng một bài riêng.

### 5.3 Quy trình kiểm định (có giáo viên ký off)

1. Người viết nội dung điền ma trận trước khi làm bài.
2. Đối chiếu với SGK gốc của ít nhất một bộ sách (curate thủ công, ghi nguồn).
3. Rà soát độ chính xác khoa học (đặc biệt phần hook và phần 20% ngoài lề) và
   kiểm tra cảnh báo an toàn (mục 4.6) nếu bài có phản ứng.
4. **Ít nhất 1 giáo viên Hóa/KHTN đối chiếu ma trận và ký off**: xác nhận đúng
   lớp, đúng bộ sách, đúng yêu cầu cần đạt. Ghi tên giáo viên và ngày ký off vào
   metadata bài học (mục 6.1).
5. Chỉ chuyển trạng thái sang "published" khi ma trận đầy đủ VÀ đã có chữ ký off.

### 5.4 Provenance — metadata bắt buộc cho mỗi bài

Để kiểm soát chất lượng khi số bài tăng lên, mỗi bài phải mang metadata nguồn gốc
(provenance). Không có provenance thì sau 10 bài rất khó kiểm soát. Các trường:
nguồn SGK, người viết, người review (giáo viên ký off), ngày review, trạng thái
(draft/review/published). Schema cụ thể ở mục 6.1.

---

## 6. Cấu trúc một bài học (Template)

Mỗi bài học theo công thức 5 bước cố định, để có thể **sản xuất hàng loạt**:

| Bước | Tên | Loại (type) | Nội dung |
|------|-----|-------------|----------|
| 1 | Hook (Cửa vào) | `hook` | Câu hỏi kỳ lạ + animation gây tò mò + vài con số ấn tượng |
| 2 | Khái niệm cốt lõi | `concept` | Kiến thức nền tảng của trục chính, animation tương tác |
| 3 | Cơ chế/phản ứng | `concept` hoặc `reaction` | Phản ứng chính, có thể điều chỉnh tham số |
| 4 | Kết nối thực tế | `realworld` | Kiến thức xuất hiện ở đâu trong đời sống |
| 5 | Kiểm tra | `quiz` | Quiz 3 câu, đúng chuẩn SGK nhưng giữ ngữ cảnh câu hỏi |

Thứ tự 5 bước này là **cố định** và được validator ép bằng `z.tuple` (mục 6.2).

**Thành phần bắt buộc của mỗi bài:**

- Thanh điều hướng stepper (thấy được tiến độ 1→5).
- "Chip SGK" ở mỗi bước (trường `sgkChip` cấp bước) — hiển thị bước này map sang
  kiến thức SGK nào, hoặc đánh dấu là phần ngoài chương trình.
- Khoảnh khắc "aha" rõ ràng ở cuối.
- Animation/mô phỏng nhẹ minh họa khái niệm.
- Nếu hook chạm tới hiện tượng ngoài chương trình (như nhiệt hạch ở bài Mặt
  trời), phải có câu tách bạch rõ ranh giới (xem mục 4.2).
- Nếu bài có phản ứng cháy/nổ, phải có cảnh báo an toàn (xem mục 4.6).
- Nút dẫn sang bài tiếp theo.

### 6.1 Mô hình dữ liệu bài học (data-driven, làm ngay từ MVP)

Bài học phải là **dữ liệu**, không phải code one-off. Dùng TypeScript interface
làm contract chính thức (không phải pseudo-JSON), để dev dùng trực tiếp và type
checker bắt lỗi khi điền thiếu trường.

```typescript
// Animation/tương tác dùng cho MVP. "molecule-3d" KHÔNG thuộc MVP — đánh dấu
// future-only để dev không kéo scope sang 3D ở giai đoạn web học tập.
type AnimationId =
  | "sun"            // mặt trời phát sáng
  | "h-atom"         // nguyên tử hydrogen
  | "combustion";    // phản ứng cháy H2 + O2
// FUTURE (không dùng ở MVP, chỉ bật khi làm app lab giai đoạn 4):
type FutureAnimationId = "molecule-3d";

type InteractiveId =
  | "star-slider"    // slider kích thước sao
  | "ratio-mixer"    // trộn tỉ lệ chất phản ứng
  | "temp-control";  // điều chỉnh nhiệt độ

interface SgkMatrix {
  grade: number;                  // lớp áp dụng
  books: ("KNTT" | "CTST" | "CD")[];
  standards: string[];            // chuẩn kiến thức GDPT 2018
  objectives: string[];           // mục tiêu cần đạt (tối đa 3 cho 1 bài)
  prerequisites: string[];        // id các bài cần học trước
  outOfCurriculum: string[];      // phần ngoài chương trình (phần 20%)
}

// Provenance — bắt buộc, để kiểm soát chất lượng khi số bài tăng (mục 5.4)
interface LessonMeta {
  sgkSources: string[];                       // trích dẫn/link SGK gốc
  author: string;                             // người viết
  reviewedBy?: string;                        // giáo viên ký off (mục 5.3)
  reviewDate?: string;                        // ngày ký off, ISO 8601
  status: "draft" | "review" | "published";   // không "published" nếu thiếu reviewedBy
  hasSafetyWarning: boolean;                  // true nếu bài có phản ứng cháy/nổ
}

// Trường CHUNG cho MỌI bước — phục vụ chip SGK cấp bước và đo tỷ lệ 80/20
interface StepBase {
  curriculumScope: "core" | "outOfCurriculum"; // bước này là kiến thức SGK hay phần ngoài lề
  estimatedMinutes: number;                    // thời lượng ước tính (để đo 80/20)
  sgkChip: string;                             // BẮT BUỘC. Bước core: nhãn SGK (vd "Phản ứng hóa học").
                                               // Bước outOfCurriculum: dạng "Ngoài chương trình: nhiệt hạch".
}

interface QuizQuestion {
  q: string;
  options: string[];
  answerIndex: number;            // phải nằm trong [0, options.length)
  mapsToObjective: number;        // index trong objectives[]; -1 nếu là câu kiểm tra hiểu nhầm
  isMisconceptionCheck?: boolean; // true nếu là câu bẫy hiểu nhầm (mục 9.3)
  feedback: string;
}

// Phản ứng tách cấu trúc (không để equation là string thường) — để render chỉ số
// dưới, kiểm tra cân bằng, và tái dùng trong quiz
interface ReactionSpecies {
  formula: string;                  // vd "H2", "O2", "H2O" (để hiển thị)
  coefficient: number;              // hệ số cân bằng, vd 2, 1, 2
  atomCounts: Record<string, number>; // số nguyên tử mỗi nguyên tố, vd {H:2} cho H2, {H:2,O:1} cho H2O
}

// Mỗi loại bước là một type riêng (dựa trên StepBase) để có thể ép đúng thứ tự
type HookStep = StepBase & {
  type: "hook"; title: string; body: string; facts: string[]; animation: AnimationId;
};
type ConceptStep = StepBase & {
  type: "concept"; title: string; body: string; animation?: AnimationId; interactive?: InteractiveId;
};
type ReactionStep = StepBase & {
  type: "reaction";
  title: string;
  reactants: ReactionSpecies[];       // [{formula:"H2",coefficient:2,atomCounts:{H:2}}, ...]
  products: ReactionSpecies[];         // [{formula:"H2O",coefficient:2,atomCounts:{H:2,O:1}}]
  displayEquation: string;             // chuỗi hiển thị, vd "2H₂ + O₂ → 2H₂O"
  safetyNote: string;                  // BẮT BUỘC nếu là phản ứng cháy/nổ
  interactive?: InteractiveId;
};
type RealworldStep = StepBase & {
  type: "realworld"; title: string; items: { icon: string; label: string; note: string }[];
};
type QuizStep = StepBase & {
  type: "quiz"; questions: QuizQuestion[];
};

type LessonStep = HookStep | ConceptStep | ReactionStep | RealworldStep | QuizStep;

interface Lesson {
  id: string;
  question: string;               // câu hỏi hook hiển thị ở trang chủ
  topicTags: string[];
  difficulty: 1 | 2 | 3;
  meta: LessonMeta;               // BẮT BUỘC — provenance
  sgkMatrix: SgkMatrix;           // BẮT BUỘC — không phát hành nếu thiếu
  // ÉP đúng 5 bước VÀ đúng thứ tự ngay ở mức TypeScript (khớp với Zod ở mục 6.2):
  steps: [HookStep, ConceptStep, ConceptStep | ReactionStep, RealworldStep, QuizStep];
  nextLessonId?: string;
}
```

**Contract quan trọng về animation:** Mỗi `AnimationId` / `InteractiveId` tương
ứng một React component đã viết sẵn và đăng ký trong một registry. Thêm bài mới =
chọn animation có sẵn + điền dữ liệu. Chỉ khi cần hiệu ứng hoàn toàn mới mới phải
code component mới (và thêm vào enum). Nếu mỗi bài lại phải code animation riêng
từ đầu thì vấn đề scale CHƯA được giải quyết — đây là ranh giới phải giữ.

### 6.2 Validation runtime (Zod) + content validator trong build

TypeScript interface chỉ bắt lỗi *kiểu dữ liệu*. Phải thêm Zod schema bắt được
**đúng thứ tự 5 bước, đúng shape từng bước, đúng 1 quiz cuối** (dùng
`z.discriminatedUnion` + `z.tuple`), cộng một content validator kiểm tra các ràng
buộc nội dung (80/20, answerIndex, mapsToObjective, an toàn, ký off).

```typescript
import { z } from "zod";

const AnimationId = z.enum(["sun", "h-atom", "combustion"]);
const InteractiveId = z.enum(["star-slider", "ratio-mixer", "temp-control"]);

// Trường chung — gắn vào mọi bước
const stepBase = {
  curriculumScope: z.enum(["core", "outOfCurriculum"]),
  estimatedMinutes: z.number().positive(),
  sgkChip: z.string().min(1),   // bắt buộc; bước ngoài CT dùng "Ngoài chương trình: ..."
};

const HookStep = z.object({
  type: z.literal("hook"),
  title: z.string().min(1),
  body: z.string().min(1),
  facts: z.array(z.string()).min(1),
  animation: AnimationId,
  ...stepBase,
});

const ConceptStep = z.object({
  type: z.literal("concept"),
  title: z.string().min(1),
  body: z.string().min(1),
  animation: AnimationId.optional(),
  interactive: InteractiveId.optional(),
  ...stepBase,
});

const ReactionSpecies = z.object({
  formula: z.string().min(1),
  coefficient: z.number().int().positive(),
  atomCounts: z.record(z.string(), z.number().int().nonnegative()), // {H:2}, {H:2,O:1}...
});

const ReactionStep = z.object({
  type: z.literal("reaction"),
  title: z.string().min(1),
  reactants: z.array(ReactionSpecies).min(1),
  products: z.array(ReactionSpecies).min(1),
  displayEquation: z.string().min(1),
  safetyNote: z.string().min(1),         // bắt buộc với phản ứng
  interactive: InteractiveId.optional(),
  ...stepBase,
});

const RealworldStep = z.object({
  type: z.literal("realworld"),
  title: z.string().min(1),
  items: z.array(z.object({
    icon: z.string(),
    label: z.string().min(1),
    note: z.string().min(1),
  })).min(1),
  ...stepBase,
});

const QuizQuestion = z.object({
  q: z.string().min(1),
  options: z.array(z.string().min(1)).min(2).max(4),
  answerIndex: z.number().int().nonnegative(),
  mapsToObjective: z.number().int().min(-1),
  isMisconceptionCheck: z.boolean().optional(),
  feedback: z.string().min(1),
}).refine((q) => q.answerIndex < q.options.length, {
  message: "answerIndex phải nằm trong [0, options.length)",
});

const QuizStep = z.object({
  type: z.literal("quiz"),
  questions: z.array(QuizQuestion).length(3),   // đúng 3 câu
  ...stepBase,
});

// Bước 3 có thể là concept HOẶC reaction
const Step3 = z.discriminatedUnion("type", [ConceptStep, ReactionStep]);

// ÉP đúng thứ tự 5 bước: hook → concept → (concept|reaction) → realworld → quiz
const StepsTuple = z.tuple([HookStep, ConceptStep, Step3, RealworldStep, QuizStep]);

const LessonSchema = z.object({
  id: z.string().min(1),
  question: z.string().min(1),
  topicTags: z.array(z.string()).min(1),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  meta: z.object({
    sgkSources: z.array(z.string()).min(1),
    author: z.string().min(1),
    reviewedBy: z.string().optional(),
    reviewDate: z.string().optional(),
    status: z.enum(["draft", "review", "published"]),
    hasSafetyWarning: z.boolean(),
  }),
  sgkMatrix: z.object({
    grade: z.number().int(),
    books: z.array(z.enum(["KNTT", "CTST", "CD"])).min(1),
    standards: z.array(z.string()).min(1),
    objectives: z.array(z.string()).min(1).max(3),
    prerequisites: z.array(z.string()),
    outOfCurriculum: z.array(z.string()),
  }),
  steps: StepsTuple,
  nextLessonId: z.string().optional(),
});

// Content validator chạy trong CI/build — chặn merge nếu sai
export function validateLesson(lesson: unknown): string[] {
  const parsed = LessonSchema.safeParse(lesson);
  if (!parsed.success) {
    return parsed.error.issues.map((i) => i.path.join(".") + ": " + i.message);
  }
  const L = parsed.data;
  const errors: string[] = [];

  // 1) Tỷ lệ 80/20 — phần ngoài chương trình ≤ 20% tổng thời lượng
  const total = L.steps.reduce((s, st) => s + st.estimatedMinutes, 0);
  const outMin = L.steps
    .filter((st) => st.curriculumScope === "outOfCurriculum")
    .reduce((s, st) => s + st.estimatedMinutes, 0);
  if (total > 0 && outMin / total > 0.2) {
    errors.push(`Phần ngoài CT chiếm ${Math.round((outMin / total) * 100)}% > 20% (80/20)`);
  }

  // 2) Quiz là bước cuối (index 4 theo tuple) — kiểm tra mapsToObjective
  const quiz = L.steps[4];
  if (quiz.type === "quiz") {
    for (const q of quiz.questions) {
      if (q.mapsToObjective !== -1 && q.mapsToObjective >= L.sgkMatrix.objectives.length) {
        errors.push("mapsToObjective vượt số mục tiêu cần đạt");
      }
    }
    // nếu bài có phần ngoài CT thì phải có ít nhất 1 câu kiểm tra hiểu nhầm
    const hasOut = L.steps.some((st) => st.curriculumScope === "outOfCurriculum");
    if (hasOut && !quiz.questions.some((q) => q.isMisconceptionCheck)) {
      errors.push("Bài có phần ngoài CT nhưng quiz thiếu câu kiểm tra hiểu nhầm");
    }
  }

  // 3) Bước reaction: cảnh báo an toàn + kiểm tra bảo toàn nguyên tố (dùng atomCounts,
  //    KHÔNG parse công thức bằng regex — chính xác và mở rộng được cho mọi nguyên tố)
  const reaction = L.steps.find((st) => st.type === "reaction");
  if (reaction && reaction.type === "reaction") {
    if (!L.meta.hasSafetyWarning) errors.push("Bài có phản ứng nhưng meta.hasSafetyWarning = false");
    if (!reaction.safetyNote) errors.push("Bước reaction thiếu safetyNote");
    // Cộng số nguyên tử mỗi nguyên tố từ atomCounts, so sánh hai vế
    const tally = (side: { coefficient: number; atomCounts: Record<string, number> }[]) => {
      const acc: Record<string, number> = {};
      for (const s of side)
        for (const [el, n] of Object.entries(s.atomCounts))
          acc[el] = (acc[el] || 0) + s.coefficient * n;
      return acc;
    };
    const lhs = tally(reaction.reactants);
    const rhs = tally(reaction.products);
    const elements = new Set([...Object.keys(lhs), ...Object.keys(rhs)]);
    for (const el of elements) {
      if ((lhs[el] || 0) !== (rhs[el] || 0)) {
        errors.push(`Phản ứng chưa cân bằng nguyên tố ${el}`);
      }
    }
  }

  // 4) Chip ngoài chương trình nên có tiền tố rõ ràng để minh bạch với người học
  for (const st of L.steps) {
    if (st.curriculumScope === "outOfCurriculum" && !/ngoài chương trình/i.test(st.sgkChip)) {
      errors.push(`Bước ngoài CT nên ghi chip dạng "Ngoài chương trình: ..." (hiện: "${st.sgkChip}")`);
    }
  }

  // 5) Không publish nếu chưa ký off
  if (L.meta.status === "published" && (!L.meta.reviewedBy || !L.meta.reviewDate)) {
    errors.push("Không được publish khi chưa có reviewedBy + reviewDate");
  }
  return errors;
}
```

Kể cả MVP chỉ có 1 bài, vẫn phải build theo interface + validator này. Nếu code
bài mẫu kiểu one-off rồi mới làm template ở giai đoạn 2, sẽ phải đập đi làm lại.

---

## 7. Kiến trúc hai sản phẩm

ChemLab gồm hai sản phẩm khác bản chất, **không nên gộp vào một**:

### 7.1 Web học tập (Sản phẩm 1 — làm trước)

- **Bản chất:** nội dung. Text, animation nhẹ, quiz.
- **Yêu cầu:** chạy mượt trên mọi trình duyệt, mobile-first, dễ sản xuất hàng loạt.
- **Vai trò:** sản phẩm khởi đầu, ra mắt trước, thu hút người dùng đầu tiên.

### 7.2 App phòng thí nghiệm (Sản phẩm 2 — mở rộng sau)

- **Bản chất:** engine. Vật lý phản ứng, mô phỏng 3D, kéo-thả phức tạp.
- **Yêu cầu:** hiệu năng cao, có thể là app riêng web/iOS/Android.
- **Vai trò:** yếu tố khác biệt, đầu tư khi web đã có người dùng và biết bài nào
  được học nhiều nhất.

### 7.3 Cách hai sản phẩm kết nối

Trong bài học trên web, nút "Mở phòng thí nghiệm" dẫn sang app lab với đúng các
chất liên quan đến bài. Học sinh thử nghiệm xong, tiến độ đồng bộ ngược về web.
Ở giai đoạn đầu, nút này chỉ là placeholder — chưa cần engine lab.

---

## 8. Lộ trình phát triển

### Giai đoạn 1 — MVP (làm trước nhất)

**Mục tiêu:** Chứng minh công thức câu-hỏi + map SGK hoạt động. Chỉ cần **1 bài
thật sự xuất sắc** để test với người dùng thật, không làm 30 bài ngay.

- **Data-driven template ngay từ đầu** — dựng TypeScript interface + Zod validator
  (mục 6.1, 6.2) và registry animation trước, rồi mới đổ nội dung bài mẫu vào.
  Không code one-off.
- Một bài mẫu hoàn chỉnh với **một trục chính duy nhất**: "Phản ứng hóa học tạo
  nước" (mục 5.2), hook "Hydrogen trong Mặt trời có liên quan gì đến nước?", có
  đầy đủ ma trận đối chiếu SGK và giáo viên ký off.
- 5 bước stepper, animation tương tác, quiz, chip SGK mỗi bước, cảnh báo an toàn.
- Trang chủ với lưới câu hỏi.
- Responsive mobile-first, dark mode.

> **Lý do chuyển template lên MVP:** Tài liệu xác định template là "sống còn" để
> scale. Nếu để sang giai đoạn 2, bài mẫu MVP sẽ là code one-off và phải đập đi
> khi nhân rộng. Làm interface + validator + registry ngay, dù chỉ 1 bài.

### Giai đoạn 2 — Nội dung (8-10 bài)

- 8-10 bài: thuốc nổ, bầu trời xanh, sắt gỉ, pin lithium, nước sôi... (mỗi bài
  một trục chính, đều phải có ma trận đối chiếu SGK + giáo viên ký off).
- Mở rộng registry animation cho các loại hiệu ứng mới.
- Công cụ nhập liệu bài học (form/CMS đơn giản) chạy qua content validator (6.2)
  để người không code cũng thêm được bài mà không phá vỡ ràng buộc.
- Hệ thống unlock: giải bài dễ mở bài khó.
- Lưu tiến độ (localStorage hoặc tài khoản đơn giản).

### Giai đoạn 3 — Gắn kết (giữ người học)

- Streak, badge, XP — thói quen học hằng ngày.
- Chế độ "theo SGK": chọn bộ sách, lớp → gợi ý bài phù hợp (dùng ma trận đối
  chiếu đã có).
- Bản đồ kiến thức: thấy mình đã học được gì.
- Trợ lý hỏi đáp bằng AI (xem ràng buộc bắt buộc ở mục 10.2).

### Giai đoạn 4 — Mở rộng (tương lai)

- Engine phản ứng: kéo-thả nguyên tử, kiểm tra hợp lệ.
- Mô phỏng 3D phân tử (lúc này mới bật "molecule-3d") và hiệu ứng phản ứng.
- App riêng web/iOS/Android, đồng bộ tiến độ với web.

---

## 9. Tiêu chí thành công của MVP (pass/fail)

Mục tiêu "chứng minh công thức hoạt động" phải đo được, nếu không sẽ không biết
khi nào nên nhân rộng. Định nghĩa trước khi test.

### 9.1 Quy mô và đối tượng test

- **Số người test:** tối thiểu **15-20 học sinh lớp 8** (ghi thẳng lớp 8 để không
  test lẫn lớp 9-10 rồi thiếu mẫu cho đúng nhóm cần đánh giá).
- **Nhóm lớp chính (quyết định pass/fail): LỚP 8** — vì bài mẫu map chính vào
  lớp 8. Đây là nhóm mà ngưỡng pass (mục 9.4) được tính.
- **Nếu có thêm học sinh lớp 9-10 (không bắt buộc):** PHẢI tách kết quả theo lớp,
  không gộp chung. Học sinh lớp 9-10 có thể đạt điểm quiz cao hơn và che mất vấn
  đề với đúng nhóm lớp 8. Kết quả lớp 9-10 chỉ để tham khảo, không kết luận pass.
- **Thiết bị:** chủ yếu trên điện thoại (đúng bối cảnh thực).

### 9.2 Chỉ số định lượng (MVP chỉ có 1 bài, tính trên nhóm lớp 8)

Vì MVP chỉ có một bài hoàn chỉnh, không thể đo "quay lại học bài thứ 2". Thay
bằng các chỉ số đo được ngay trên một bài:

| Chỉ số | Ngưỡng pass (đề xuất) | Vai trò |
|--------|------------------------|---------|
| Tỷ lệ hoàn thành bài (completion rate) | ≥ 70% học xong cả 5 bước | Cổng bắt buộc |
| Điểm quiz sau học | ≥ 70% trả lời đúng (trừ câu kiểm tra hiểu nhầm, tính riêng) | Cổng bắt buộc |
| Ý định học tiếp (đo bằng hành vi) | ≥ 60% **bấm nút "học bài tiếp theo"** | Tín hiệu hỗ trợ |

> **Metric "ý định học tiếp" chỉ đo bằng MỘT hành vi: tỷ lệ bấm nút "học bài tiếp
> theo"** (dù bài đó mới là placeholder "sắp ra mắt"). Đây là số đo hành vi khách
> quan. Việc hỏi miệng "em có muốn học tiếp không" KHÔNG gộp vào con số này mà
> chuyển sang phần định tính (9.3), vì hai loại tín hiệu không tương đương.

### 9.3 Chỉ số định tính

- **Aha moment:** học sinh giải thích lại được bằng lời của mình câu trả lời cho
  câu hỏi hook (ví dụ tự nói được hydrogen kết hợp với oxygen tạo ra nước, và đó
  là một phản ứng hóa học).
- **Phản hồi miệng về ý định học tiếp:** hỏi trực tiếp "em có muốn học bài tiếp
  không, vì sao" — dùng để hiểu *lý do*, bổ trợ cho số liệu hành vi ở 9.2.
- **Bài kiểm tra hiểu nhầm (cụ thể, có ngưỡng):** sau bài, hỏi trực tiếp câu bẫy
  — "Mặt trời có cháy bằng phản ứng H2 + O2 không?" — **pass khi ≥ 90% trả lời
  đúng** (mặt trời dùng nhiệt hạch, không phải phản ứng hóa học H2+O2). Câu này
  là `isMisconceptionCheck` trong schema (mục 6.1).
- **Giáo viên ký off:** ít nhất 1 giáo viên Hóa/KHTN xác nhận ma trận đối chiếu
  đúng lớp, đúng bộ sách, đúng yêu cầu cần đạt (mục 5.3). Đây là điều kiện bắt
  buộc, không chỉ là "niềm tin" chung chung.

### 9.4 Quy tắc quyết định (rõ ràng, không mâu thuẫn)

Chốt theo một kiểu duy nhất: **completion và quiz là cổng bắt buộc**, tính trên
nhóm lớp 8 (mục 9.1).

**PASS** khi thỏa ĐỒNG THỜI tất cả các cổng bắt buộc:
- Completion rate (lớp 8) ≥ 70%, VÀ
- Quiz score (lớp 8) ≥ 70%, VÀ
- Bài kiểm tra hiểu nhầm ≥ 90%, VÀ
- Có giáo viên ký off ma trận đối chiếu SGK, VÀ
- Không có hiểu nhầm khoa học lặp lại ở nhiều học sinh.

Chỉ số "ý định học tiếp" (9.2) là **tín hiệu hỗ trợ** đánh giá mức hấp dẫn, KHÔNG
phải cổng bắt buộc và không tự quyết định pass/fail.

**FAIL** khi **bất kỳ** cổng bắt buộc nào ở trên không đạt (ví dụ completion hoặc
quiz dưới ngưỡng, hoặc hiểu nhầm < 90%, hoặc chưa có giáo viên ký off, hoặc xuất
hiện hiểu nhầm khoa học lặp lại).

**Khi FAIL:** điều chỉnh công thức (câu hỏi, độ sâu, cách trình bày, cách tách
bạch phần ngoài CT) và test lại trên cùng 1 bài, trước khi đầu tư thêm bài mới.

---

## 10. Công nghệ đề xuất

### 10.1 Giai đoạn 1-3 (Web học tập)

| Thành phần | Công nghệ | Lý do |
|------------|-----------|-------|
| Framework | React + TypeScript | Phổ biến, dễ tuyển người, type-safe cho schema bài học |
| Validation | Zod | Bắt ràng buộc nội dung lúc chạy/build (mục 6.2) |
| Styling | Tailwind CSS | Phát triển nhanh, nhất quán |
| Animation | Framer Motion | Animation mượt, API dễ dùng |
| Mô phỏng nhẹ | Canvas API | Đủ cho animation giai đoạn đầu, không cần 3D nặng |
| Build tool | Vite | Nhanh, hiện đại |
| Deploy | Vercel / Netlify | Miễn phí, dễ triển khai |
| Lưu dữ liệu | localStorage → Supabase | Bắt đầu đơn giản, nâng cấp sau |
| Nội dung bài học | Curate thủ công (theo interface mục 6.1) | Đảm bảo độ chính xác và bám SGK |

### 10.2 Ràng buộc cho trợ lý hỏi đáp AI (nếu triển khai ở giai đoạn 3)

Vì người dùng chính có thể là **trẻ vị thành niên**, tính năng AI hỏi đáp KHÔNG
được coi là một bullet tính năng thông thường. Phải có các ràng buộc sau trước
khi bật cho học sinh:

- **An toàn nội dung:** lọc đầu vào/đầu ra, chỉ giới hạn trong phạm vi học tập;
  chặn nội dung không phù hợp lứa tuổi. Có cơ chế báo cáo/chặn.
- **Quyền riêng tư:** tuân thủ quy định bảo vệ dữ liệu trẻ em; không thu thập dữ
  liệu cá nhân nhạy cảm; minh bạch với phụ huynh về dữ liệu được lưu.
- **Kiểm soát nội dung sư phạm:** câu trả lời AI nên bám nội dung bài đã kiểm
  định, tránh "bịa" kiến thức sai chương trình (cân nhắc giới hạn AI trong ngữ
  cảnh bài học thay vì hỏi đáp mở hoàn toàn).
- **Chi phí:** API có chi phí theo lượng dùng; cần ước tính và đặt giới hạn
  (rate limit, quota) để tránh chi phí vượt kiểm soát.
- **Logging và giám sát:** lưu log hội thoại để rà soát chất lượng và an toàn,
  với chính sách lưu trữ minh bạch.

> Nếu chưa đáp ứng được các ràng buộc này, nên hoãn tính năng AI hỏi đáp mở, hoặc
> giới hạn ở dạng gợi ý/giải thích trong phạm vi nội dung đã kiểm định.

### 10.3 Về dữ liệu hóa học (PubChem)

PubChem / PUG-REST là **nguồn phụ trợ**, không phải dependency chính của MVP.
Nguồn: https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest (kiểm tra 06/2026).

- **Dùng cho:** tra cứu dữ liệu hợp chất (khối lượng phân tử, cấu trúc) khi cần.
- **KHÔNG thay thế được:** nội dung SGK, kiểm định sư phạm, hay tính đúng của
  kịch bản bài học. Những thứ này phải curate thủ công, có người rà soát.
- **Với MVP:** dữ liệu bài nên được curate thủ công kèm nguồn, không phụ thuộc
  API ngoài để chạy được bài học.

### 10.4 Giai đoạn 4 (App lab — để sau)

- Three.js cho mô phỏng 3D phân tử (lúc này mới bật "molecule-3d").
- RDKit (hoặc tương tự) để kiểm tra phản ứng hợp lệ.
- WebSocket nếu cần tính năng cộng tác real-time.

> **Lưu ý:** Canvas API đủ cho giai đoạn đầu. Three.js (3D nặng) để dành cho app
> lab, không đưa vào web học tập để tránh làm web nặng nề.

---

## 11. Yếu tố thành công và rủi ro

### 11.1 Yếu tố quyết định thành công

- **Mô hình sản xuất nội dung scale được** (interface + Zod validator + registry).
- **Câu hỏi phải dẫn đúng kiến thức VÀ được bài trả lời** (triết lý question-first
  mục 4.1 + ma trận đối chiếu SGK + nguyên tắc 80/20 đo được).
- **Một bài một trục chính** (chống quá tải cho persona lớp 8-10).
- **Độ chính xác khoa học** (cảnh báo mục 4.2, kiểm tra hiểu nhầm mục 9.3).
- **An toàn cho học sinh** (cảnh báo thí nghiệm mục 4.6).
- **Chất lượng một bài mẫu** ở giai đoạn 1, có giáo viên ký off.

### 11.2 Rủi ro cần theo dõi

| Rủi ro | Giải pháp |
|--------|-----------|
| Nội dung khó scale | Interface + Zod validator + registry animation từ MVP (mục 6) |
| Hook không khớp nội dung bài | Hook phải được bài trả lời (mục 4.1) |
| Bài quá tải mục tiêu | Một bài một trục chính (mục 4.4, 5.2) |
| Map sai cấp lớp/sai SGK | Gắn đúng nguồn + giáo viên ký off (mục 5.2, 5.3) |
| 80/20 chỉ là khẩu hiệu | Đo bằng curriculumScope + estimatedMinutes + validator (mục 4.3, 6.2) |
| Câu hỏi cạn dần | Phần khô khan đưa vào app lab dạng thử-và-sai |
| Hiểu nhầm kiến thức khoa học | Hook không gây hiểu nhầm + câu tách bạch + kiểm tra hiểu nhầm (4.1, 4.2, 9.3) |
| Học sinh thử phản ứng nguy hiểm | Cảnh báo an toàn bắt buộc (mục 4.6) |
| Dữ liệu bài sai (sai thứ tự bước, sai quiz) | Zod tuple + discriminatedUnion + validator (mục 6.2) |
| Phản ứng khó tái dùng/kiểm tra cân bằng | Tách reactants/products + atomCounts có cấu trúc (mục 6.1, 6.2) |
| TS không ép thứ tự bước | steps là tuple cụ thể ở cả TS lẫn Zod (mục 6.1, 6.2) |
| Mất kiểm soát chất lượng khi nhiều bài | Metadata provenance bắt buộc (mục 5.4, 6.1) |
| Kết quả test bị nhiễu do trộn lớp | Test chính lớp 8, tách kết quả theo lớp (mục 9.1) |
| Tính năng lab biến mất | Tách thành sản phẩm riêng, đầu tư ở giai đoạn 4 |
| MVP không biết pass hay fail | Quy tắc quyết định rõ ràng, nhất quán (mục 9.4) |
| Claim đối thủ lỗi thời | Bảng có nguồn + ngày kiểm tra (mục 2.2) |
| Rủi ro AI với trẻ vị thành niên | Ràng buộc an toàn/riêng tư/chi phí (mục 10.2) |

---

## 12. Bước tiếp theo

1. Hoàn thiện tài liệu mô tả dự án này (đã cập nhật bản 1.5).
2. Thiết kế registry animation + form nhập liệu chạy qua Zod validator (mục 6).
3. Code bài mẫu giai đoạn 1 theo data-driven template, hook "Hydrogen trong Mặt
   trời có liên quan gì đến nước?", trục chính "Phản ứng hóa học tạo nước", kèm
   ma trận đối chiếu SGK và quy trình ký off.
4. Test với 15-20 học sinh thật (nhóm chính lớp 8) theo tiêu chí mục 9.
5. Quyết định nhân rộng hay điều chỉnh theo quy tắc mục 9.4.

---

## Phụ lục — Nguồn đã kiểm tra (06/2026)

- Labster Compare Plans: https://www.labster.com/compare-plans
- PhET About: https://phet.colorado.edu/en/about
- ChemCollective (Carnegie Mellon): https://chemcollective.org/
- Khan Academy High School Chemistry: https://www.khanacademy.org/science/hs-chemistry
- PubChem PUG-REST docs: https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest
- KHTN 8 KNTT, Bài 2 "Phản ứng hóa học" (nguồn thứ cấp định vị bài; đối chiếu SGK
  gốc khi viết): https://vietjack.com/khoa-hoc-tu-nhien-8-kn/bai-2-phan-ung-hoa-hoc.jsp
- Tài liệu tìm hiểu chương trình KHTN THCS (Bộ GD&ĐT / HNUE):
  https://dtbdtx.hnue.edu.vn/Portals/0/Tai%20lieu%20tim%20hieu%20chuong%20trinh%20mon%20Khoa%20hoc%20tu%20nhien.pdf
- Tài liệu tìm hiểu chương trình môn Hóa học THPT (Bộ GD&ĐT / HNUE):
  https://dtbdtx.hnue.edu.vn/Portals/0/Tai%20lieu%20tim%20hieu%20chuong%20trinh%20mon%20Hoa%20hoc.pdf

*Tài liệu này là định hướng sản phẩm, sẽ được cập nhật khi dự án tiến triển.*
*Mọi số liệu đối thủ cần ghi ngày kiểm tra lại khi cập nhật.*
