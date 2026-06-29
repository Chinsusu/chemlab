# ADR-0001: Stack TypeScript + React + Node (monorepo, web trước → mobile sau)

**Trạng thái:** Chấp nhận — 06/2026
**Liên quan:** [ADR-0002](0002-deploy-cloudflare-pages-supabase.md), doc 01 mục 2 & 9

## Bối cảnh

- ChemLab làm **web học tập trước**, sau **mở rộng sang app Android/iOS** (cùng sản
  phẩm học tập, không phải app phòng thí nghiệm 3D).
- Web là cửa vào khám phá: cần **SEO và tải nhanh** (link chia sẻ câu hỏi, mở là
  học không cần cài, Google index được).
- Sản phẩm **data-driven**: `Lesson` schema + Zod validator chính là sản phẩm
  (xem PRD mục 6). Sự nhất quán của schema giữa các nơi là yếu tố sống còn.
- Người làm: **một người vibe code bằng Codex + Claude**, không tuyển người. Yếu
  tố quyết định không phải "dễ tuyển" mà là "AI mạnh nhất ở đâu" và "ai làm QA khi
  làm một mình".
- Tải dự kiến: web tĩnh trên CDN + backend chỉ I/O nhẹ (lưu tiến độ/auth), không có
  tính toán CPU nặng phía server.

## Quyết định

Dùng **TypeScript xuyên suốt cả ba tầng**:

- **Web:** React + Vite (giữ React DOM thật để SEO/tải nhanh).
- **Mobile (sau này):** React Native qua Expo → iOS + Android từ một codebase.
- **Backend (khi cần):** Node.js (Fastify) hoặc Pages Functions/Workers.

Tổ chức **monorepo** với `packages/core` (TypeScript dùng chung: Lesson schema,
Zod validator, types, business logic, API client). Cả web, mobile, backend đều
import lõi này.

## Lý do

- **AI mạnh nhất ở TS/React/Node:** corpus huấn luyện lớn nhất → ít hallucinate,
  code idiomatic. Quan trọng khi để AI viết phần lớn code.
- **Một ngôn ngữ để AI ôm trọn hệ thống:** đổi `Lesson` schema một chỗ, AI sửa
  được validator + web + mobile + server nhất quán vì tất cả cùng nói TS.
- **Type system là QA khi làm solo:** không có người review thứ hai; TS strict +
  Zod là cặp mắt thứ hai bắt lỗi ngay khi AI viết sai.
- **Schema viết một lần, chạy mọi nơi:** server validate khi nhận bài, web validate
  khi build, mobile validate khi đồng bộ — cùng một định nghĩa.
- **Web giữ React thật** để không hi sinh SEO/tải nhanh — thứ quyết định kênh khám
  phá của sản phẩm học tập.

## Hệ quả

**Tích cực:**
- Một ngôn ngữ, một mental model cho cả hệ thống.
- Tái dùng tối đa logic/schema/validator giữa web, mobile, backend.
- Hợp với vibe code solo bằng AI; type safety bù cho việc thiếu reviewer.
- Hạ tầng nhẹ, chi phí thấp (xem ADR-0002).

**Đánh đổi:**
- UI phải viết hai lần: web (DOM) và mobile (React Native primitives) không dùng
  chung component.
- Animation Canvas của web phải làm lại bằng `react-native-skia` cho mobile.
- Monorepo cần cấu hình ban đầu (workspace, path alias) phức tạp hơn một repo đơn.

## Phương án đã cân nhắc

- **Flutter (Dart, một codebase cả ba):** Mạnh nhất về animation và một codebase
  cho mobile. **Loại** vì Flutter Web render canvas → SEO yếu, tải nặng, first-paint
  chậm — tệ cho web học tập làm cửa vào; Dart là ngôn ngữ mới, ngoài thế mạnh của
  Codex/Claude. Sẽ hấp dẫn hơn nếu web chỉ là phụ.
- **Universal Expo (React Native Web, 1 codebase cả web + mobile):** Chia sẻ ~85%
  kể cả UI. **Giữ làm phương án dự phòng** — nếu tới lúc làm thấy không cần SEO/tải
  nhanh của web bằng việc có ít thứ để quản nhất, thì cách này thắng cho người làm
  một mình.
- **Native riêng (Kotlin + Swift) + web React:** Hiệu năng tốt nhất. **Loại** vì
  3 codebase, 3 mental model — không hợp một người.
- **Backend Go / Python:** Go nhanh nhưng nhiều boilerplate, không chia sẻ type;
  Python (FastAPI) tốt cho AI nhưng phải duy trì schema hai lần. **Loại làm BE
  chính**; Python có thể là microservice AI riêng về sau, core vẫn Node.

## Điều kiện xem lại

- Nếu SEO/tải nhanh của web không còn quan trọng → cân nhắc chuyển sang universal
  Expo để giảm số thứ phải bảo trì.
- Nếu xuất hiện tải tính toán CPU nặng phía server (vd mô phỏng phản ứng phức tạp
  cho app lab) → tách riêng phần đó, có thể dùng ngôn ngữ khác cho đúng việc, không
  ảnh hưởng web học tập.
