import { ModuleKey } from "@/store/useAppStore";
import { navigationModules } from "@/lib/module-navigation";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Props {
  active: ModuleKey;
  onSelect: (k: ModuleKey) => void;
}

// Menu sempre recolhido (só ícones); o nome do módulo aparece ao passar o mouse.
export function Sidebar({ active, onSelect }: Props) {
  return (
    <aside
      aria-label="Navegação principal"
      className="liquid-glass-sidebar fixed left-3 top-3 bottom-3 z-[1000] print:hidden flex flex-col isolate
        h-[calc(100vh-24px)] w-[60px] rounded-[24px]"
    >
      <div className="liquid-glass-surface" aria-hidden="true" />
      <div className="liquid-glass-refraction" aria-hidden="true" />

      <nav className="relative z-10 flex-1 py-3 px-2.5 space-y-1 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:w-0">
        {navigationModules.map((item) => {
          const isActive = active === item.key;
          const Icon = item.icon;
          return (
            <Tooltip key={item.key} delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onSelect(item.key)}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={item.label}
                  className={`group w-full flex items-center justify-center p-2 rounded-[12px] transition-colors duration-200
                    ${isActive
                      ? "liquid-glass-active text-white"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white/45 dark:hover:bg-white/[0.09] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]"
                    }`}
                >
                  <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? "" : "group-hover:scale-110"}`} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={14}>{item.label}</TooltipContent>
            </Tooltip>
          );
        })}
      </nav>
    </aside>
  );
}
