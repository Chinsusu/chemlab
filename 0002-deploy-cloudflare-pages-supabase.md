# ADR-0002: Deploy lên Cloudflare Pages + Supabase cho MVP

**Trạng thái:** Chấp nhận — 06/2026
**Liên quan:** [ADR-0001](0001-stack-typescript-react-node.md), doc 01 mục 9

## Bối cảnh

- Cần nơi chạy **web tĩnh** + **auth/lưu tiến độ** với **ít việc vận hành nhất**
  cho một người làm một mình.
- Muốn **rẻ ở giai đoạn đầu** nhưng có **đường lớn dần** mà không phải đập đi.
- Đã chốt TypeScript xuyên suốt (ADR-0001) → ưu tiên hạ tầng giữ được TS, kể cả
  phần backend khi cần.
- Web là static (Vite build) + nội dung bài là dữ liệu tĩnh; backend chỉ I/O nhẹ.

## Quyết định

- **MVP = Cloudflare Pages (web tĩnh trên CDN) + Supabase free (auth/Postgres/
  storage).** Web gọi thẳng Supabase từ client. Không cần server riêng, không cần
  Workers.
- **Khi cần logic phía server** (giấu API key cho gia sư AI, webhook, xử lý nhạy
  cảm): thêm **Pages Functions / Workers** viết TypeScript, cùng repo, dùng chung
  `packages/core`.
- **Nếu cần Node đầy đủ** (thư viện kén runtime): tách backend Fastify sang
  Railway/Fly.io/Render, web vẫn ở Cloudflare Pages.
- **Supabase free → Pro** ($25/tháng) khi có người dùng thật cần online 24/7.

## Lý do

- **Cloudflare Pages hợp web tĩnh React/Vite:** build ra static, phục vụ trên CDN
  toàn cầu, tự lo HTTPS, băng thông không giới hạn, miễn phí ở mức dự án. Deploy
  một phát.
- **Supabase free đủ cho giai đoạn đầu** (số liệu kiểm tra 06/2026): 500 MB
  database, 50.000 MAU cho auth, 1 GB storage, 5 GB băng thông, 2 project, API
  không giới hạn. Tiến độ học là dữ liệu rất nhẹ; nội dung bài nằm trong bundle,
  không phình database.
- **Giữ TypeScript xuyên suốt:** Pages Functions/Workers viết bằng TS, vẫn import
  `packages/core` — không phá vỡ luận điểm một-ngôn-ngữ (ADR-0001).
- **Hệ sinh thái hợp vibe code:** Supabase là backend phổ biến nhất cho app xây
  bằng AI tool (2026) → nhiều tài liệu/ví dụ cho Codex/Claude tham chiếu.

## Hệ quả

**Tích cực:**
- Chi phí ~0 ở MVP; một lần deploy là chạy.
- CDN toàn cầu, tải nhanh cho học sinh.
- Đường nâng cấp rõ ràng, giữ nguyên TS ở mọi bước.

**Đánh đổi / điểm phải canh:**
- **Cloudflare chạy runtime Workers (V8), KHÔNG phải Node đầy đủ.** Một số API Node
  thuần/thư viện native không có; phải viết theo Web API, dùng `nodejs_compat` khi
  cần. Với Supabase ở edge, gọi qua REST/HTTP client thay vì giữ kết nối Postgres
  trực tiếp.
- **Supabase free tạm dừng project sau 7 ngày không có query** (mất ~30s khởi động
  lại, dữ liệu không mất). Vá: uptime ping (vd Uptime Robot) mỗi 5 phút; hoặc lên
  Pro để bỏ hẳn.
- **Supabase free không có backup tự động.** Vá: GitHub Actions + Cloudflare R2.
- **Lưu ý mốc thời gian:** yêu cầu Postgres grants mới cho Data API áp dụng cho
  project mới từ 30/05/2026 và project cũ từ 30/10/2026 — kiểm tra ảnh hưởng tới
  project cụ thể trước hạn (xác nhận lại trên supabase.com/pricing khi tới gần).

## Phương án đã cân nhắc

- **Vercel / Netlify (host web):** Tốt tương đương cho web tĩnh. Cloudflare Pages
  được chọn vì CDN/băng thông rộng rãi và Pages Functions/Workers gắn liền cho
  đường nâng cấp cùng repo. Có thể đổi mà không ảnh hưởng kiến trúc.
- **Chạy Node server thẳng trên Cloudflare:** Không khả thi — Cloudflare không chạy
  Node server truyền thống (nghe cổng), chỉ chạy Workers. Do đó tách rõ: web→Pages,
  logic→Workers, hoặc Node đầy đủ→host ngoài.
- **Firebase thay Supabase:** NoSQL, tính tiền theo lượt đọc/ghi dễ spike; Supabase
  là Postgres (SQL, hợp dữ liệu có cấu trúc), chi phí dễ đoán hơn, ít khóa hệ.

## Điều kiện xem lại

- Khi có người dùng thật mở app hằng ngày và việc duy trì uptime ping/backup thủ
  công tốn công → lên Supabase Pro.
- Khi cần logic server vượt khả năng Workers → tách Fastify ra host ngoài
  (Railway/Fly.io).
- Khi chạm bất kỳ hạn mức free nào (database, băng thông, MAU) → nâng cấp; theo dõi
  dashboard, vì Supabase chỉ cho một lần gia hạn (grace period).
