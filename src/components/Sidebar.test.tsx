import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Sidebar } from "./Sidebar";
import { TooltipProvider } from "./ui/tooltip";

afterEach(cleanup);

function setup() {
  const onSelect = vi.fn();
  render(<TooltipProvider><Sidebar active="home" onSelect={onSelect} /></TooltipProvider>);
  return { sidebar: screen.getByLabelText("Navegação principal"), onSelect };
}

function pointer(target: HTMLElement, type: string, pointerType: string) {
  const event = new MouseEvent(type, { bubbles: true });
  Object.defineProperty(event, "pointerType", { value: pointerType });
  fireEvent(target, event);
}

describe("Sidebar expansion", () => {
  it("expands on mouse entry and collapses on exit", () => {
    const { sidebar } = setup();
    expect(sidebar).toHaveAttribute("data-expanded", "false");
    pointer(sidebar, "pointerover", "mouse");
    expect(sidebar).toHaveAttribute("data-expanded", "true");
    pointer(sidebar, "pointerout", "mouse");
    expect(sidebar).toHaveAttribute("data-expanded", "false");
  });

  it("uses the toggle on touch and closes after selecting a module", () => {
    const { sidebar, onSelect } = setup();
    pointer(sidebar, "pointerover", "touch");
    expect(sidebar).toHaveAttribute("data-expanded", "false");
    fireEvent.click(screen.getByRole("button", { name: "Expandir barra lateral" }));
    expect(sidebar).toHaveAttribute("data-expanded", "true");
    fireEvent.click(screen.getByRole("button", { name: "Gantt" }));
    expect(onSelect).toHaveBeenCalledWith("gantt");
    expect(sidebar).toHaveAttribute("data-expanded", "false");
  });

  it("allows closing the hovered sidebar with its button or Escape", () => {
    const { sidebar } = setup();
    pointer(sidebar, "pointerover", "mouse");
    fireEvent.click(screen.getByRole("button", { name: "Recuar barra lateral" }));
    expect(sidebar).toHaveAttribute("data-expanded", "false");
    pointer(sidebar, "pointerout", "mouse");
    pointer(sidebar, "pointerover", "mouse");
    fireEvent.keyDown(sidebar, { key: "Escape" });
    expect(sidebar).toHaveAttribute("data-expanded", "false");
  });
});
