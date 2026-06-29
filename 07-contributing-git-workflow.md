# 07 — Đóng góp & Quy trình Git

> Quy trình làm việc chung: nhánh, commit, PR, CI, review. Áp dụng cho cả dev và
> người viết nội dung (bài học cũng đi qua PR + validator).

## 1. Chiến lược nhánh

- `main` — luôn ở trạng thái deploy được. Không commit thẳng.
- Nhánh tính năng: `feat/<mo-ta-ngan>`, sửa lỗi: `fix/<mo-ta-ngan>`, nội dung:
  `content/<slug-bai>`, tài liệu: `docs/<mo-ta>`.
- Nhánh ngắn, gộp sớm. Một nhánh một mục đích.

## 2. Commit

Theo **Conventional Commits** (doc 03 mục 10):
```
feat(lesson): them khung stepper 5 buoc
fix(quiz): sua dem cau kiem tra hieu nham
content(phan-ung-tao-nuoc): them ban draft bai mau
docs(design-system): bo sung token mau chu de
```
- type: `feat` `fix` `docs` `refactor` `test` `chore` `style` `content`.
- Mô tả ngắn, tiếng Việt không dấu hoặc tiếng Anh (tránh lỗi encoding git log).
- Commit nhỏ, một ý mỗi commit.

## 3. Pull Request

Mỗi thay đổi vào `main` qua PR. Mô tả PR nêu:
- **Làm gì & vì sao** (liên hệ mục PRD nếu có).
- **Ảnh hưởng** (route/component/dữ liệu nào).
- Với PR nội dung: xác nhận đã chạy `validateLesson` pass và trạng thái ký off.
- Ảnh chụp màn hình (cả light + dark, cả mobile) cho thay đổi UI.

### Mẫu PR
```
## Tóm tắt
(thay đổi gì, vì sao)

## Loại
- [ ] feat  - [ ] fix  - [ ] content  - [ ] docs  - [ ] refactor

## Checklist
- [ ] typecheck + lint pass
- [ ] test pass
- [ ] (nếu là bài học) validateLesson pass, đã ký off nếu publish
- [ ] (nếu UI) đã kiểm cả light/dark + mobile
- [ ] đã cập nhật tài liệu liên quan
```

## 4. CI (chạy tự động trên mỗi PR)

Thứ tự, fail ở bước nào thì chặn merge:
1. **Typecheck** — `tsc --noEmit` (strict).
2. **Lint** — ESLint + Prettier check.
3. **Validate bài học** — chạy `validateLesson` trên toàn bộ `lessons/data/`. Bất
   kỳ bài nào trả lỗi → fail.
4. **Test** — Vitest.
5. **Build** — `vite build` thành công.

## 5. Checklist review code

Người review kiểm:
- Đúng coding standard (doc 03): không `any`, đặt tên đúng, import gọn.
- Đúng design system (doc 02): dùng token, không hardcode màu, accessibility
  (vùng chạm ≥44px, focus rõ, reduced-motion).
- Dữ liệu đi qua Zod/validator, storage qua `lib/storage.ts`.
- Animation mới: đăng ký registry, tôn trọng reducedMotion, dọn dẹp Canvas
  (doc 06).
- Có test cho logic quan trọng.

## 6. Checklist review nội dung (bài học)

- Hook được chính bài trả lời (không "câu view").
- Một trục chính, ≤3 mục tiêu.
- 80/20: phần ngoài CT ≤20% (validator xác nhận).
- Chip SGK đủ ở mọi bước; bước ngoài CT ghi "Ngoài chương trình: …".
- Có `safetyNote` nếu có phản ứng.
- Quiz 3 câu, có câu kiểm tra hiểu nhầm nếu có phần ngoài CT.
- Ma trận SGK đúng cấp lớp + đúng bộ sách.
- **Đã có giáo viên ký off** trước khi đổi sang `published`.

## 7. Định nghĩa "Hoàn thành" (Definition of Done)

Một thay đổi coi là xong khi:
- CI xanh (typecheck, lint, validate, test, build).
- Đã review và duyệt.
- (UI) kiểm cả light/dark + mobile.
- (Nội dung) validator pass + ký off đầy đủ nếu publish.
- Tài liệu liên quan đã cập nhật.

## 8. Lưu ý encoding (quan trọng cho dự án tiếng Việt)

Toàn bộ file nguồn lưu **UTF-8**. Khi sinh/ghi file nội dung tiếng Việt bằng
script, ghi qua công cụ đảm bảo UTF-8 (vd Python với `encoding="utf-8"`), tránh
heredoc shell có thể làm hỏng ký tự có dấu. Kiểm tra file không chứa ký tự thay
thế (U+FFFD) trước khi commit.
