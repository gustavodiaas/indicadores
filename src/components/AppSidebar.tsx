import {
  BarChart3, Calculator, ArrowRightLeft, ShieldCheck,
  Clock, Timer, Square, FileText
} from "lucide-react";
import { type ModuleKey } from "@/store/useAppStore";

const modules: { key: ModuleKey; label: string; icon: React.ElementType }[] = [
  { key: "resumo", label: "Resumo Executivo", icon: FileText },
  { key: "produtividade", label: "Produtividade", icon: BarChart3 },
  { key: "payback", label: "Payback", icon: Calculator },
  { key: "movimentacao", label: "Movimentação", icon: ArrowRightLeft },
  { key: "qualidade", label: "Qualidade", icon: ShieldCheck },
  { key: "disponibilidade", label: "Disponibilidade", icon: Clock },
  { key: "leadtime", label: "Lead Time", icon: Timer },
  { key: "area", label: "Área", icon: Square },
];

interface Props {
  active: ModuleKey;
  onSelect: (key: ModuleKey) => void;
}

export function AppSidebar({ active, onSelect }: Props) {
  return (
    <aside className="w-60 min-h-screen bg-sidebar-bg flex flex-col shrink-0">
      <div className="px-5 py-5 border-b border-sidebar-border-clr">
        <h1 className="text-lg font-bold text-sidebar-active-fg tracking-tight">Lean Consulting</h1>
        <p className="text-xs text-sidebar-fg mt-0.5">Engenharia de Produção</p>
      </div>
      <nav className="flex-1 py-3 px-3 space-y-1">
        {modules.map(m => {
          const isActive = active === m.key;
          return (
            <button
              key={m.key}
              onClick={() => onSelect(m.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-sidebar-active text-sidebar-active-fg"
                  : "text-sidebar-fg hover:bg-sidebar-hover hover:text-sidebar-active-fg"
              }`}
            >
              <m.icon className="h-4 w-4 shrink-0" />
              <span>{m.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
