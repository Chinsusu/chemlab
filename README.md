# Architecture Decision Records (ADR)

> Ghi lại các quyết định kiến trúc quan trọng cùng lý do, để sau này nhìn lại biết
> "vì sao hồi đó chọn thế" mà không phải tranh luận lại từ đầu.

Mỗi ADR là một quyết định, đánh số tăng dần, không xóa. Khi một quyết định bị thay
thế, tạo ADR mới và đánh dấu cái cũ là "Bị thay thế" (Superseded), không sửa lịch sử.

## Danh sách

| # | Quyết định | Trạng thái |
|---|------------|------------|
| [0001](0001-stack-typescript-react-node.md) | Stack TypeScript + React + Node (monorepo, web trước → mobile sau) | Chấp nhận |
| [0002](0002-deploy-cloudflare-pages-supabase.md) | Deploy lên Cloudflare Pages + Supabase cho MVP | Chấp nhận |

## Định dạng

Mỗi ADR gồm: Trạng thái · Bối cảnh · Quyết định · Lý do · Hệ quả (tích cực + đánh
đổi) · Phương án đã cân nhắc · Điều kiện xem lại.

## Tài liệu vận hành

- [Pilot test protocol](08-pilot-test-protocol.md) — cách test MVP với học sinh lớp 8.
