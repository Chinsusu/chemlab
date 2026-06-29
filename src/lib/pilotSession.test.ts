import { describe, expect, it } from "vitest";

import { createMemoryStorage } from "@/lib/storage";
import { loadPilotSession, resolvePilotSessionFromUrl } from "@/lib/pilotSession";

describe("pilot session", () => {
  it("creates an anonymous session from a pilot link", () => {
    const storage = createMemoryStorage();

    const session = resolvePilotSessionFromUrl(
      "https://chemlab.test/lesson/phan-ung-tao-nuoc?pilot=s01&grade=8",
      storage
    );

    expect(session).toMatchObject({
      studentCode: "S01",
      grade: 8
    });
    expect(session?.id).toBeTruthy();
    expect(loadPilotSession(storage)?.studentCode).toBe("S01");
  });

  it("does not create tracking for invalid or missing pilot params", () => {
    const storage = createMemoryStorage();

    expect(resolvePilotSessionFromUrl("https://chemlab.test/?pilot=student name&grade=8", storage)).toBeNull();
    expect(resolvePilotSessionFromUrl("https://chemlab.test/?pilot=S01&grade=7", storage)).toBeNull();
    expect(resolvePilotSessionFromUrl("https://chemlab.test/", storage)).toBeNull();
  });

  it("creates a new session id when the student code changes on the same device", () => {
    const storage = createMemoryStorage();
    const first = resolvePilotSessionFromUrl("https://chemlab.test/?pilot=S01&grade=8", storage);
    const second = resolvePilotSessionFromUrl("https://chemlab.test/?pilot=S02&grade=8", storage);

    expect(first?.id).toBeTruthy();
    expect(second?.id).toBeTruthy();
    expect(second?.id).not.toBe(first?.id);
    expect(second?.studentCode).toBe("S02");
  });
});
