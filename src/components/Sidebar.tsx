import { useState } from "react";
import { ModuleKey } from "@/store/useAppStore";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { navigationModules } from "@/lib/module-navigation";

interface Props {
  active: ModuleKey;
  onSelect: (k: ModuleKey) => void;
}

export function Sidebar({ active, onSelect }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [keyboardFocus, setKeyboardFocus] = useState(false);
  const expanded = isExpanded || isHovered || keyboardFocus;

  const navItems = navigationModules;

  return (
    <aside
      aria-label="Navegação principal"
      data-expanded={expanded}
      onPointerEnter={(event) => { if (event.pointerType === "mouse") setIsHovered(true); }}
      onPointerLeave={() => { setIsHovered(false); setIsExpanded(false); }}
      onFocusCapture={(event) => { if (event.target.matches(":focus-visible")) setKeyboardFocus(true); }}
      onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setKeyboardFocus(false); }}
      onKeyDown={(event) => { if (event.key === "Escape") { setIsExpanded(false); setIsHovered(false); setKeyboardFocus(false); } }}
      className={`liquid-glass-sidebar fixed left-3 top-3 bottom-3 z-[1000] print:hidden flex flex-col isolate
        h-[calc(100vh-24px)]
        rounded-[24px]
        transition-[width] duration-300 ease-out
        ${expanded ? "w-60" : "w-[60px]"}`}
    >
      <div className="liquid-glass-surface" aria-hidden="true" />
      <div className="liquid-glass-refraction" aria-hidden="true" />
      {/* Hover no desktop; botão para telas de toque. */}
      <div className="relative z-10 flex items-center justify-between px-3 h-16 border-b border-black/[0.055] dark:border-white/[0.09] shrink-0">
        {expanded && (
          <span className="text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-100 truncate">
            Navegação
          </span>
        )}
            <button
              onClick={() => {
                setIsExpanded(!expanded);
                setIsHovered(false);
                setKeyboardFocus(false);
              }}
              aria-expanded={expanded}
              aria-label={expanded ? "Recuar barra lateral" : "Expandir barra lateral"}
              className="p-2 rounded-[10px] text-slate-500 dark:text-slate-400
hover:text-slate-900 dark:hover:text-white
hover:bg-black/[0.05] dark:hover:bg-white/10
transition-colors duration-200 mx-auto"
            >
              {expanded ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
            </button>
      </div>

      {/* Lista de Módulos */}
      <nav className="relative z-10 flex-1 py-3 px-2.5 space-y-1 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-300/70 dark:[&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full">
        {navItems.map((item) => {
          const isActive = active === item.key;
          const Icon = item.icon;
          return (
                <button
                  key={item.key}
                  onClick={() => { onSelect(item.key); setIsExpanded(false); }}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={item.label}
              className={`
  group w-full flex items-center gap-3
  px-2 py-2 rounded-[12px]
  transition-colors duration-200
  ${isActive
    ? "liquid-glass-active text-white font-semibold"
    : "text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white/45 dark:hover:bg-white/[0.09] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] font-medium"
  }
`}
                >
              <div className="shrink-0 flex items-center justify-center w-6 h-6">
                <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? "" : "group-hover:scale-110"}`} />
              </div>
              
              <span aria-hidden={!expanded} className={`sidebar-label text-[13px] truncate tracking-tight text-left ${expanded ? "opacity-100" : "opacity-0 w-0"}`}>
                  {item.label}
                </span>
                </button>
          );
        })}
      </nav>
    </aside>
  );
}
