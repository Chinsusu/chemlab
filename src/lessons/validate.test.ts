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

  it("rejects steps without a challenge", () => {
    const lesson = structuredClone(phanUngTaoNuoc) as unknown as { steps: Array<Record<string, unknown>> };
    const firstStep = lesson.steps[0];
    if (!firstStep) throw new Error("Expected first step");
    delete firstStep.challenge;

    expect(validateLesson(lesson)).toEqual(
      expect.arrayContaining([expect.stringContaining("steps.0.challenge")])
    );
  });

  it("rejects manipulate challenges without an interactive", () => {
    const lesson = structuredClone(phanUngTaoNuoc) as Lesson;
    const challenge = lesson.steps[2].challenge;
    if (challenge.type !== "manipulate") throw new Error("Expected manipulate challenge");
    challenge.interactive = undefined;

    expect(validateLesson(lesson)).toEqual(
      expect.arrayContaining([expect.stringContaining("type 'manipulate' phải có interactive")])
    );
  });

  it("rejects future interactive ids in MVP lessons", () => {
    const lesson = structuredClone(phanUngTaoNuoc) as unknown as {
      steps: Array<{ challenge: { interactive?: { id: string } } }>;
    };
    const thirdStep = lesson.steps[2];
    if (!thirdStep) throw new Error("Expected third step");
    const interactive = thirdStep.challenge.interactive;
    if (!interactive) throw new Error("Expected interactive");
    interactive.id = "star-slider";

    expect(validateLesson(lesson)).toEqual(
      expect.arrayContaining([expect.stringContaining("Invalid enum value")])
    );
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
