# 03 — Coding Standards

> Quy ước code cho ChemLab. Mục tiêu: code nhất quán, type-safe, dễ đọc, dễ review.
> Lint và CI ép phần lớn các quy tắc này tự động.

## 1. TypeScript

- **`strict: true`** trong `tsconfig.json`. Không tắt.
- **Cấm `any`.** Nếu thật sự cần, dùng `unknown` rồi thu hẹp kiểu. `any` lọt qua
  review chỉ khi có comment lý do rõ ràng.
- **Type cho mọi dữ liệu ngoài** (API, localStorage, JSON bài học) phải qua Zod
  parse, không ép kiểu (`as`) một cách mù quáng.
- Ưu tiên `type` cho union/tuple, `interface` cho object có thể mở rộng. Nhất quán
  với schema bài học (PRD 6.1).
- Bật `noUncheckedIndexedAccess` để buộc kiểm tra khi truy cập mảng/record.

## 2. Quy ước đặt tên

| Đối tượng | Quy ước | Ví dụ |
|-----------|---------|-------|
| Component | PascalCase | `QuestionCard`, `SafetyNote` |
| File component | PascalCase.tsx | `QuestionCard.tsx` |
| Hook | camelCase, tiền tố `use` | `useProgress`, `useLesson` |
| Hàm/biến | camelCase | `validateLesson`, `currentStep` |
| Type/Interface | PascalCase | `Lesson`, `QuizQuestion` |
| Hằng số | UPPER_SNAKE_CASE | `MAX_QUIZ_QUESTIONS` |
| File tiện ích/dữ liệu | kebab-case.ts | `phan-ung-tao-nuoc.ts`, `storage.ts` |
| AnimationId/InteractiveId | kebab-case (string literal) | `"h-atom"`, `"star-slider"` |

- Tên theo **cái người dùng hiểu**, không theo cách hệ thống cài đặt (theo doc 02
  và skill viết UI). Vd: `nextLesson` chứ không `routeTransitionHandler`.
- Tiếng Anh cho code/định danh; tiếng Việt cho nội dung hiển thị và comment giải
  thích nghiệp vụ.

## 3. React

- **Chỉ functional component + hooks.** Không class component.
- Props luôn có type tường minh (interface `XxxProps`). Không props rác.
- Component thuần trình bày tách khỏi component có logic dữ liệu. Logic tái dùng
  đưa vào hook.
- Một component một file. File > ~200 dòng là dấu hiệu cần tách.
- Không side-effect trong thân render; dùng `useEffect`/handler.
- Key trong list dùng id ổn định, không dùng index.
- Tránh `useMemo`/`useCallback` sớm — chỉ tối ưu khi có vấn đề đo được.

## 4. Dữ liệu & validation

- **Zod là nguồn sự thật** cho shape dữ liệu bài học. Type TS suy ra từ Zod khi
  có thể (`z.infer`), tránh khai báo trùng dễ lệch.
- Mọi bài học PHẢI qua `validateLesson` (PRD 6.2). CI chạy validator trên toàn bộ
  thư mục `lessons/data/`.
- Truy cập storage chỉ qua `lib/storage.ts`. Cấm gọi `localStorage` trực tiếp
  trong component/hook khác.

## 5. Styling (Tailwind)

- Dùng utility class Tailwind, map sẵn từ design tokens (doc 02). KHÔNG hardcode
  hex trong className; dùng token (`text-text`, `bg-surface`, `text-energy-500`…).
- Không viết CSS rời rạc trừ khi thật cần (animation Canvas, keyframe phức tạp);
  khi cần đặt trong `styles/`.
- Thứ tự class: layout → spacing → typography → màu → trạng thái. Dùng plugin
  `prettier-plugin-tailwindcss` để tự sắp xếp.
- Tránh "magic number" trong spacing; chỉ dùng thang 4px (doc 02 mục 4).
- Dark mode: dùng biến thể `dark:` hoặc token tự đổi, không viết nhánh màu thủ công.

## 6. Tổ chức import

Thứ tự, cách nhau bằng dòng trống:
1. Thư viện ngoài (`react`, `framer-motion`, `zod`…)
2. Alias nội bộ (`@/components`, `@/lessons`…)
3. Tương đối (`./`, `../`)
4. Kiểu (import type) gom riêng nếu nhiều

Cấu hình path alias `@/* → src/*` trong `tsconfig` + `vite.config`.

## 7. Comment & tài liệu

- Comment giải thích **tại sao**, không lặp lại **cái gì** code đã nói.
- Public API (hàm/hook dùng nhiều nơi) có JSDoc ngắn.
- Quy ước nghiệp vụ quan trọng (vd "câu isMisconceptionCheck không tính vào điểm
  quiz chính") phải có comment dẫn chiếu mục PRD.

## 8. Xử lý lỗi

- Không nuốt lỗi im lặng. Lỗi dữ liệu bài → log rõ + hiện màn lỗi dev.
- `try/catch` quanh I/O (storage, fetch). Trả về kiểu kết quả rõ ràng, không
  throw xuyên tầng UI mà không bắt.
- Với người dùng cuối: thông báo lỗi nói **chuyện gì xảy ra và làm gì tiếp**,
  giọng của sản phẩm, không xin lỗi sướt mướt, không lộ chi tiết kỹ thuật.

## 9. Lint & format

`.eslintrc` (mô tả, cấu hình thật khi khởi tạo repo):

- Base: `eslint:recommended` + `@typescript-eslint/recommended` +
  `plugin:react-hooks/recommended` + `plugin:jsx-a11y/recommended`.
- Bật: `@typescript-eslint/no-explicit-any` (error), `no-console`
  (warn, cho phép `console.error`), `react-hooks/exhaustive-deps` (warn).
- `jsx-a11y` để ép accessibility (doc 02 mục 8).

Prettier: `singleQuote: false`, `semi: true`, `printWidth: 100`,
`prettier-plugin-tailwindcss`. Format tự động khi commit (lint-staged + husky).

## 10. Commit & nhánh

- **Conventional Commits.** Dạng: `type(scope): mô tả ngắn`.
  - `feat(lesson): them khung stepper 5 buoc`
  - `fix(quiz): sua dem cau kiem tra hieu nham`
  - `docs(readme): cap nhat ban do tai lieu`
  - type: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `style`.
- Mô tả commit ngắn gọn, tiếng Việt không dấu hoặc tiếng Anh (tránh lỗi encoding
  trong git log ở một số môi trường).
- Chi tiết quy trình nhánh/PR ở doc 07.

## 11. Test

- **Vitest + React Testing Library.**
- Bắt buộc test cho: `validateLesson` (mọi nhánh ràng buộc — thiếu bước, sai thứ
  tự, quiz ≠ 3 câu, phản ứng chưa cân bằng, publish thiếu ký off), `lib/chemistry`
  (cân bằng atomCounts), `useProgress` (unlock logic).
- Component quan trọng (Stepper, QuizBlock) có test hành vi cơ bản.
- Test theo hành vi người dùng (vai trò, nhãn), không test chi tiết triển khai.
