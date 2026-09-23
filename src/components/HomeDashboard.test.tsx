import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HomeDashboard } from "./HomeDashboard";
import { navigationModules } from "@/lib/module-navigation";

afterEach(cleanup);
const setup = () => {
  const onSelect = vi.fn();
  const onThemeChange = vi.fn();
  render(<HomeDashboard theme="light" onSelect={onSelect} onThemeChange={onThemeChange} />);
  return { onSelect, onThemeChange };
};

describe("Home dashboard", () => {
  it("shows every module once and opens the correct destination", () => {
    const { onSelect } = setup();
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(3);
    for (const module of navigationModules.filter(m => m.key !== "home")) {
      const button = screen.getByRole("button", { name: new RegExp(module.title, "i") });
      fireEvent.click(button);
      expect(onSelect).toHaveBeenLastCalledWith(module.key);
    }
  });
  it("searches without accents and clears the empty state", () => {
    setup();
    fireEvent.change(screen.getByRole("textbox", { name: "Buscar módulos" }), { target: { value: "movimentacao" } });
    expect(screen.getByRole("button", { name: /Movimentação/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Payback/ })).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "zzzzz" } });
    expect(screen.getByRole("status")).toHaveTextContent("Nenhum módulo");
    fireEvent.click(screen.getByRole("button", { name: "Limpar busca" }));
    expect(screen.getByRole("button", { name: /Gantt/ })).toBeInTheDocument();
  });
  it("preserves theme selection", () => {
    const { onThemeChange } = setup();
    expect(screen.getByRole("button", { name: "Claro" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Escuro" }));
    expect(onThemeChange).toHaveBeenCalledWith("dark");
  });
});
