# Pilot Test Protocol — ChemLab MVP v0.1

Mục tiêu: test bài mẫu với 15-20 học sinh lớp 8 để quyết định MVP pass/fail theo
PRD mục 9. Không thu tên, số điện thoại, email hay thông tin cá nhân học sinh.

## Chuẩn bị trước buổi test

1. Áp migration `supabase/migrations/001_pilot_tracking.sql` trong Supabase SQL
   Editor.
2. Đảm bảo production có `VITE_SUPABASE_URL` là base URL dạng
   `https://<project>.supabase.co` và `VITE_SUPABASE_ANON_KEY`.
3. Tạo danh sách mã ẩn danh `S01` đến `S20`.
4. Mỗi học sinh mở link riêng:
   `https://chemlab.chinsu.workers.dev/lesson/phan-ung-tao-nuoc?pilot=S01&grade=8`
   rồi thay `S01` theo mã của em đó.

## Cách tổ chức

- Không giảng trước nội dung phản ứng tạo nước.
- Cho học sinh tự học trên điện thoại.
- Người quan sát chỉ hỗ trợ lỗi kỹ thuật, không giải thích đáp án.
- Sau khi học sinh bấm xong quiz, hỏi ngắn:
  - Em trả lời được câu hỏi đầu bài bằng lời của mình không?
  - Mặt trời có cháy bằng phản ứng H2 + O2 không? Vì sao?
  - Em có muốn học bài tiếp theo không? Vì sao?

## Report sau buổi test

Chạy report nội bộ bằng service role key:

```bash
pnpm pilot:report
```

Report tự tính trên nhóm lớp 8:

- completion rate
- quiz accuracy
- misconception pass rate
- next-lesson click rate
- teacher signoff gate

Gate “không có hiểu nhầm khoa học lặp lại” phải chốt thủ công từ phần quan sát/
phỏng vấn, không tự động hóa bằng event.
