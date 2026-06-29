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

function renderLesson(progressApi = createProgressApi(), pilotTracker?: PilotTracker) {
  render(
    <MemoryRouter>
      <LessonRenderer lesson={phanUngTaoNuoc} progressApi={progressApi} pilotTracker={pilotTracker} />
    </MemoryRouter>
  );
  return progressApi;
}

function createPilotTracker(): PilotTracker {
  return {
    session: null,
    trackStepCompleted: vi.fn(),
    trackChallengeEvent: vi.fn(),
    trackQuizAnswer: vi.fn(),
    trackQuizCompleted: vi.fn(),
    trackNextLessonClicked: vi.fn()
  };
}

async function solveHook(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Có, giống phản ứng tạo nước" }));
  expect(screen.getByText(/Mặt trời sinh năng lượng bằng phản ứng hạt nhân/)).toBeVisible();
  await user.click(screen.getByRole("button", { name: "Bước tiếp theo →" }));
}

async function solveConcept(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: /Hydrogen/ }));
  await user.click(screen.getByRole("button", { name: /Oxygen/ }));
  await user.click(screen.getByRole("button", { name: "Thử" }));
  expect(screen.getByText(/Hydrogen và oxygen là chất tham gia/)).toBeVisible();
  await user.click(screen.getByRole("button", { name: "Bước tiếp theo →" }));
}

async function solveReaction(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "2 H₂" }));
  await user.click(screen.getByRole("button", { name: "Tăng H₂" }));
  await user.click(screen.getByRole("button", { name: "Tăng H₂" }));
  await user.click(screen.getByRole("button", { name: "Tăng O₂" }));
  await user.click(screen.getByRole("button", { name: "Thử" }));
  expect(screen.getByText(/Tỉ lệ 2 H₂ : 1 O₂ tạo nước không dư/)).toBeVisible();
  await user.click(screen.getByRole("button", { name: "Bước tiếp theo →" }));
}

async function solveRealworld(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: /Nước quanh ta/ }));
  await user.click(screen.getByRole("button", { name: /An toàn thí nghiệm/ }));
  await waitFor(() => {
    expect(screen.getByText(/Cùng một phản ứng có thể giúp ta hiểu/)).toBeVisible();
  });
  await user.click(screen.getByRole("button", { name: "Bước tiếp theo →" }));
}

async function reachQuiz(user: ReturnType<typeof userEvent.setup>) {
  await solveHook(user);
  await solveConcept(user);
  await solveReaction(user);
  await solveRealworld(user);
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
    expect(screen.getByRole("button", { name: "Bước tiếp theo →" })).toBeDisabled();
  });

  it("allows a wrong hook prediction to reveal and unlock the next mission", async () => {
    const user = userEvent.setup();
    renderLesson();

    await user.click(screen.getByRole("button", { name: "Có, giống phản ứng tạo nước" }));

    expect(screen.getByText(/Chưa đúng: Mặt trời dùng phản ứng nhiệt hạch/)).toBeVisible();
    expect(screen.getByText(/Mặt trời sinh năng lượng bằng phản ứng hạt nhân/)).toBeVisible();
    expect(screen.getByRole("button", { name: "Bước tiếp theo →" })).toBeEnabled();
  });

  it("shows ratio mixer failure feedback before accepting the correct 2:1 ratio", async () => {
    const user = userEvent.setup();
    renderLesson();
    await solveHook(user);
    await solveConcept(user);

    await user.click(screen.getByRole("button", { name: "2 H₂" }));
    await user.click(screen.getByRole("button", { name: "Tăng H₂" }));
    await user.click(screen.getByRole("button", { name: "Tăng O₂" }));
    await user.click(screen.getByRole("button", { name: "Thử" }));

    expect(screen.getByText("Dư oxygen — mỗi O₂ cần 2 H₂.")).toBeVisible();
    expect(screen.getByRole("button", { name: "Bước tiếp theo →" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Tăng H₂" }));
    await user.click(screen.getByRole("button", { name: "Thử" }));

    expect(screen.getByText(/Tỉ lệ 2 H₂ : 1 O₂ tạo nước không dư/)).toBeVisible();
    expect(screen.getByRole("button", { name: "Bước tiếp theo →" })).toBeEnabled();
  });

  it("requires opening both real-world cards before the quiz unlocks", async () => {
    const user = userEvent.setup();
    renderLesson();
    await solveHook(user);
    await solveConcept(user);
    await solveReaction(user);

    expect(screen.getByRole("button", { name: "Bước tiếp theo →" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: /Nước quanh ta/ }));
    expect(screen.getByRole("button", { name: "Bước tiếp theo →" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: /An toàn thí nghiệm/ }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Bước tiếp theo →" })).toBeEnabled();
    });
  });

  it("does not count the misconception check in the main quiz score", async () => {
    const user = userEvent.setup();
    renderLesson();
    await reachQuiz(user);

    expect(screen.getByRole("heading", { name: "Kiểm tra nhanh" })).toBeVisible();
    expect(screen.getAllByRole("group")).toHaveLength(3);
    expect(screen.getByText("Điểm quiz chính: 0/2")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Nước" }));
    await user.click(screen.getByRole("button", { name: "2H₂ + O₂ → 2H₂O" }));
    await user.click(screen.getByRole("button", { name: "Không, Mặt trời dùng phản ứng nhiệt hạch" }));

    expect(screen.getByText("Bạn đúng 3/3")).toBeVisible();
    expect(screen.getByText("Điểm quiz chính: 2/2")).toBeVisible();
    expect(screen.getByText("Vượt bẫy hiểu nhầm ✓")).toBeVisible();
  });

  it("records progress when challenges are solved and next lesson is clicked", async () => {
    const user = userEvent.setup();
    const progressApi = renderLesson();

    await solveHook(user);
    expect(progressApi.markStep).toHaveBeenCalledWith("phan-ung-tao-nuoc", 1);

    await solveConcept(user);
    await solveReaction(user);
    await solveRealworld(user);

    await user.click(screen.getByRole("button", { name: "Nước" }));
    await user.click(screen.getByRole("button", { name: "2H₂ + O₂ → 2H₂O" }));
    await user.click(screen.getByRole("button", { name: "Không, Mặt trời dùng phản ứng nhiệt hạch" }));

    expect(progressApi.completeLesson).toHaveBeenCalledWith("phan-ung-tao-nuoc");

    await user.click(screen.getByRole("link", { name: "Học bài tiếp theo →" }));

    expect(progressApi.recordNextLessonClick).toHaveBeenCalledWith("phan-ung-tao-nuoc");
  });

  it("emits pilot challenge, quiz, completion, and next lesson events", async () => {
    const user = userEvent.setup();
    const pilotTracker = createPilotTracker();

    renderLesson(createProgressApi(), pilotTracker);
    await reachQuiz(user);

    expect(pilotTracker.trackStepCompleted).toHaveBeenCalledWith(0);
    expect(pilotTracker.trackChallengeEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        challengeId: "water-reaction-mix",
        challengeEvent: "solved"
      })
    );

    await user.click(screen.getByRole("button", { name: "Nước" }));
    await user.click(screen.getByRole("button", { name: "2H₂ + O₂ → 2H₂O" }));
    await user.click(screen.getByRole("button", { name: "Không, Mặt trời dùng phản ứng nhiệt hạch" }));

    expect(pilotTracker.trackQuizAnswer).toHaveBeenCalledTimes(3);
    await waitFor(() => {
      expect(pilotTracker.trackQuizCompleted).toHaveBeenCalledWith(2, 2);
    });
    expect(pilotTracker.trackStepCompleted).toHaveBeenCalledWith(4);

    await user.click(screen.getByRole("link", { name: "Học bài tiếp theo →" }));

    expect(pilotTracker.trackNextLessonClicked).toHaveBeenCalledTimes(1);
  });
});
