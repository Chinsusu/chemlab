import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { LessonRenderer } from "@/components/lesson/LessonRenderer";
import { phanUngTaoNuoc } from "@/lessons/data/phan-ung-tao-nuoc";

function renderLesson() {
  render(
    <MemoryRouter>
      <LessonRenderer lesson={phanUngTaoNuoc} />
    </MemoryRouter>
  );
}

describe("LessonRenderer", () => {
  it("renders the lesson shell with five step controls", () => {
    renderLesson();

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Hydrogen trong Mặt trời có liên quan gì đến nước?"
      })
    ).toBeVisible();
    expect(screen.getByLabelText("Tiến độ bài học")).toBeVisible();
    expect(screen.getAllByRole("button", { name: /^(1|2|3|4|5)/ })).toHaveLength(5);
    expect(screen.getByText("Ngoài chương trình: Mặt trời & nhiệt hạch")).toBeVisible();
  });

  it("does not count the misconception check in the main quiz score", async () => {
    const user = userEvent.setup();
    renderLesson();

    for (let i = 0; i < 4; i += 1) {
      await user.click(screen.getByRole("button", { name: "Bước tiếp theo →" }));
    }

    expect(screen.getByRole("heading", { name: "Kiểm tra nhanh" })).toBeVisible();
    expect(screen.getAllByRole("group")).toHaveLength(3);
    expect(screen.getByText("Điểm quiz chính: 0/2")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Nước" }));
    await user.click(screen.getByRole("button", { name: "2H₂ + O₂ → 2H₂O" }));
    await user.click(screen.getByRole("button", { name: "Không, Mặt trời dùng phản ứng nhiệt hạch" }));

    expect(screen.getByText("Điểm quiz chính: 2/2")).toBeVisible();
  });
});
