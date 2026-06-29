import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { LessonRenderer } from "@/components/lesson/LessonRenderer";
import type { PilotTracker } from "@/hooks/usePilotTracking";
import { emptyProgress } from "@/lib/storage";
import { phanUngTaoNuoc } from "@/lessons/data/phan-ung-tao-nuoc";

function createProgressApi() {
  return {
    progress: emptyProgress,
    markStep: vi.fn(),
    completeLesson: vi.fn(),
    recordNextLessonClick: vi.fn()
  };
}

function renderLesson(progressApi = createProgressApi()) {
  render(
    <MemoryRouter>
      <LessonRenderer lesson={phanUngTaoNuoc} progressApi={progressApi} />
    </MemoryRouter>
  );
  return progressApi;
}

function createPilotTracker(): PilotTracker {
  return {
    session: null,
    trackStepCompleted: vi.fn(),
    trackQuizAnswer: vi.fn(),
    trackQuizCompleted: vi.fn(),
    trackNextLessonClicked: vi.fn()
  };
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

  it("records progress when advancing and clicking next lesson", async () => {
    const user = userEvent.setup();
    const progressApi = renderLesson();

    await user.click(screen.getByRole("button", { name: "Bước tiếp theo →" }));

    expect(progressApi.markStep).toHaveBeenCalledWith("phan-ung-tao-nuoc", 1);

    for (let i = 0; i < 3; i += 1) {
      await user.click(screen.getByRole("button", { name: "Bước tiếp theo →" }));
    }

    expect(progressApi.markStep).toHaveBeenCalledWith("phan-ung-tao-nuoc", 4);
    expect(progressApi.completeLesson).toHaveBeenCalledWith("phan-ung-tao-nuoc");

    await user.click(screen.getByRole("link", { name: "Học bài tiếp theo →" }));

    expect(progressApi.recordNextLessonClick).toHaveBeenCalledWith("phan-ung-tao-nuoc");
  });

  it("emits pilot quiz and next lesson events", async () => {
    const user = userEvent.setup();
    const pilotTracker = createPilotTracker();

    render(
      <MemoryRouter>
        <LessonRenderer lesson={phanUngTaoNuoc} progressApi={createProgressApi()} pilotTracker={pilotTracker} />
      </MemoryRouter>
    );

    for (let i = 0; i < 4; i += 1) {
      await user.click(screen.getByRole("button", { name: "Bước tiếp theo →" }));
    }

    await user.click(screen.getByRole("button", { name: "Nước" }));
    await user.click(screen.getByRole("button", { name: "2H₂ + O₂ → 2H₂O" }));
    await user.click(screen.getByRole("button", { name: "Không, Mặt trời dùng phản ứng nhiệt hạch" }));

    expect(pilotTracker.trackQuizAnswer).toHaveBeenCalledTimes(3);
    await waitFor(() => {
      expect(pilotTracker.trackQuizCompleted).toHaveBeenCalledWith(2, 2);
    });

    await user.click(screen.getByRole("link", { name: "Học bài tiếp theo →" }));

    expect(pilotTracker.trackNextLessonClicked).toHaveBeenCalledTimes(1);
  });
});
