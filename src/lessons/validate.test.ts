import { describe, expect, it } from "vitest";

import { phanUngTaoNuoc } from "@/lessons/data/phan-ung-tao-nuoc";
import type { Lesson } from "@/lessons/schema";
import { validateLesson } from "@/lessons/validate";

function cloneLesson(): Lesson {
  return structuredClone(phanUngTaoNuoc);
}

describe("validateLesson", () => {
  it("accepts the MVP water reaction lesson", () => {
    expect(validateLesson(phanUngTaoNuoc)).toEqual([]);
  });

  it("rejects lessons where out-of-curriculum time exceeds 20%", () => {
    const lesson = cloneLesson();
    lesson.steps[0].estimatedMinutes = 3;

    expect(validateLesson(lesson)).toContain("Phần ngoài CT chiếm 33% > 20%");
  });

  it("rejects an unbalanced reaction from atomCounts", () => {
    const lesson = cloneLesson();
    const reaction = lesson.steps[2];
    if (reaction.type !== "reaction") throw new Error("Expected step 3 to be reaction");
    const firstProduct = reaction.products[0];
    if (!firstProduct) throw new Error("Expected reaction product");
    firstProduct.coefficient = 1;

    expect(validateLesson(lesson)).toContain("Phản ứng chưa cân bằng nguyên tố H");
  });

  it("rejects published lessons without teacher sign-off", () => {
    const lesson = cloneLesson();
    lesson.meta.status = "published";
    lesson.meta.reviewedBy = undefined;
    lesson.meta.reviewDate = undefined;

    expect(validateLesson(lesson)).toContain("Không được publish khi chưa có reviewedBy + reviewDate");
  });

  it("rejects out-of-curriculum steps without a clear chip prefix", () => {
    const lesson = cloneLesson();
    lesson.steps[0].sgkChip = "Mặt trời";

    expect(validateLesson(lesson)).toContain(
      'Bước ngoài CT cần chip "Ngoài chương trình: ..." (Mặt trời)'
    );
  });
});
