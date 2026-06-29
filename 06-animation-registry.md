# 06 — Registry Animation (Hợp đồng component)

> Cách hệ thống animation/tương tác hoạt động và cách thêm hiệu ứng mới. Đây là
> cơ chế cốt lõi giúp ChemLab **scale nội dung**: bài học là dữ liệu, hiệu ứng là
> component tái dùng.

## 1. Vì sao có registry

Nếu mỗi bài phải code animation riêng từ đầu, vấn đề scale không được giải quyết —
10 bài là 10 lần code thủ công. Registry tách bạch:

- **Bài học** chỉ tham chiếu hiệu ứng qua `AnimationId` / `InteractiveId` (string).
- **Component hiệu ứng** viết một lần, đăng ký vào registry, dùng lại nhiều bài.

Thêm bài mới = chọn hiệu ứng có sẵn + điền dữ liệu. Chỉ khi cần hiệu ứng **hoàn
toàn mới** mới viết component mới và thêm vào enum. **Đây là ranh giới phải giữ**
(PRD mục 6.1).

## 2. Hai loại

| Loại | Mục đích | Ví dụ id |
|------|----------|----------|
| `AnimationId` | Hiệu ứng minh họa, chủ yếu xem | `"sun"`, `"h-atom"`, `"combustion"` |
| `InteractiveId` | Có điều khiển, người học thao tác | `"star-slider"`, `"ratio-mixer"`, `"temp-control"` |

`"molecule-3d"` là **future-only** — KHÔNG thuộc registry MVP. Chỉ bật khi làm app
lab giai đoạn 4 (cần Three.js). Không kéo vào web học tập.

## 3. Hợp đồng component (contract)

Mọi animation component tuân theo một interface props chung, nhận đúng dữ liệu của
bước mà nó minh họa và tôn trọng giảm chuyển động:

```typescript
interface AnimationProps {
  // dữ liệu bước (tùy loại) — vd reaction nhận reactants/products
  data?: unknown;
  // bắt buộc: tắt/giảm hiệu ứng khi người dùng bật prefers-reduced-motion
  reducedMotion: boolean;
  // kích thước khả dụng (mobile-first, co theo container)
  width: number;
}

type AnimationComponent = React.FC<AnimationProps>;
```

Quy tắc bắt buộc:
- **Tôn trọng `reducedMotion`:** khi `true`, hiển thị trạng thái tĩnh có ý nghĩa
  (khung hình cuối, ảnh tĩnh), KHÔNG chạy vòng lặp chuyển động.
- **Mobile-first:** vẽ theo `width` truyền vào, không cố định kích thước cứng.
- **Tự dọn dẹp:** Canvas/`requestAnimationFrame` phải hủy trong cleanup của
  `useEffect` để tránh rò rỉ khi rời bài.
- **Màu vật lý cố định cho cảnh phản ứng** (lửa ấm, nước mát) — không đảo theo
  dark mode (doc 02 mục 9).

## 4. Registry

```typescript
// src/animations/registry.ts
import type { AnimationComponent } from "./types";
import { SunAnimation } from "./SunAnimation";
import { HAtomAnimation } from "./HAtomAnimation";
import { CombustionAnimation } from "./CombustionAnimation";

const animations: Record<string, AnimationComponent> = {
  "sun": SunAnimation,
  "h-atom": HAtomAnimation,
  "combustion": CombustionAnimation,
};

export function getAnimation(id: string): AnimationComponent | null {
  return animations[id] ?? null;
}
```

`StepView` gọi `getAnimation(step.animation)`; nếu `null` thì bỏ qua phần hiệu ứng
(bước vẫn render nội dung). Tương tự có `getInteractive(id)` cho `InteractiveId`.

## 5. Thêm một animation mới

1. Tạo component trong `src/animations/`, theo `AnimationProps`, tôn trọng
   `reducedMotion`, dọn dẹp Canvas.
2. Thêm string literal vào `AnimationId` (PRD 6.1) và Zod enum (PRD 6.2) — để bài
   học tham chiếu được và validator chấp nhận.
3. Đăng ký vào `registry.ts`.
4. Lazy-load nếu hiệu ứng nặng (chỉ tải khi bài dùng).
5. Viết một test render cơ bản (mount không lỗi, có nhánh reducedMotion).

## 6. Canvas hay Framer Motion?

- **Canvas API:** cho mô phỏng "vật lý" — nguyên tử quay, phản ứng cháy, hạt
  chuyển động. Vẽ 2D nhẹ, hợp mobile.
- **Framer Motion:** cho chuyển cảnh UI, micro-interaction, reveal. Không dùng
  cho mô phỏng hạt phức tạp.
- **KHÔNG dùng Three.js/WebGL 3D** ở web học tập — để dành app lab (tránh bundle
  nặng, tụt hiệu năng mobile).

## 7. Hiệu năng

- Hủy `requestAnimationFrame` khi unmount; dừng vòng lặp khi tab ẩn nếu có thể.
- Giới hạn số hạt/khung hình hợp lý cho điện thoại tầm trung.
- Lazy-load component hiệu ứng theo bài.
- Đo trên thiết bị thật (persona dùng điện thoại), không chỉ trên desktop.
