import { describe, expect, it } from "vitest";
import { runPendingWipe, WIPE_KEYS } from "./wipe";

describe("Apagar dados", () => {
  it("does nothing unless requested", async () => {
    localStorage.setItem("consultoria-lean-state", "{}");
    expect(await runPendingWipe()).toBe(false);
    expect(localStorage.getItem("consultoria-lean-state")).toBe("{}");
  });

  it("removes project data from app, MFV and Gantt, keeping the theme", async () => {
    for (const k of WIPE_KEYS) localStorage.setItem(k, "x");
    localStorage.setItem("app-theme", "dark");
    sessionStorage.setItem("lean-wipe-pending", "1");
    expect(await runPendingWipe()).toBe(true);
    for (const k of WIPE_KEYS) expect(localStorage.getItem(k)).toBeNull();
    expect(localStorage.getItem("app-theme")).toBe("dark");
    expect(sessionStorage.getItem("lean-wipe-pending")).toBeNull();
  });
});
