import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";

import { App } from "@/App";

afterEach(() => {
  window.localStorage.clear();
});

describe("App routes", () => {
  it("renders saved lesson progress on the progress page", async () => {
    window.localStorage.setItem(
      "chemlab.progress.v1",
      JSON.stringify({
        completedLessonIds: ["phan-ung-tao-nuoc"],
        lessonSteps: {
          "phan-ung-tao-nuoc": 4
        },
        nextLessonClicks: {
          "phan-ung-tao-nuoc": 2
        }
      })
    );

    render(
      <MemoryRouter initialEntries={["/progress"]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: "Tiến độ học" })).toBeVisible();

    await waitFor(() => {
      expect(screen.getByText("Đã hoàn thành")).toBeVisible();
    });

    expect(screen.getByText("Bước 5/5")).toBeVisible();
    expect(screen.getByText("2 lượt bấm bài tiếp theo")).toBeVisible();
  });
});
