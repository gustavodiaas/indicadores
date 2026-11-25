import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Sidebar } from "./Sidebar";
import { TooltipProvider } from "./ui/tooltip";
import { navigationModules } from "@/lib/module-navigation";

afterEach(cleanup);

function setup() {
  const onSelect = vi.fn();
  render(<TooltipProvider><Sidebar active="home" onSelect={onSelect} /></TooltipProvider>);
  return { sidebar: screen.getByLabelText("Navegação principal"), onSelect };
}

describe("Sidebar", () => {
  it("stays collapsed: one icon button per module and no expand toggle", () => {
    const { sidebar } = setup();
    expect(sidebar.className).toContain("w-[60px]");
    expect(sidebar.querySelectorAll("nav button")).toHaveLength(navigationModules.length);
    expect(screen.queryByRole("button", { name: /barra lateral/i })).toBeNull();
  });

  it("shows the module name in a tooltip on focus", async () => {
    setup();
    fireEvent.focus(screen.getByRole("button", { name: "Gantt" }));
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Gantt");
  });

  it("selects a module and marks the active one", () => {
    const { onSelect } = setup();
    expect(screen.getByRole("button", { name: "Home" })).toHaveAttribute("aria-current", "page");
    fireEvent.click(screen.getByRole("button", { name: "Gantt" }));
    expect(onSelect).toHaveBeenCalledWith("gantt");
  });
});
