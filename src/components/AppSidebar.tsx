import {
  BarChart3, Calculator, ArrowRightLeft, ShieldCheck,
  Clock, Timer, Square, FileText, Factory
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
    // A mágica acontece aqui: 'print:hidden' garante que a sidebar suma no PDF
    <aside className="print:hidden w-64 min-h-screen bg-sidebar border-r border-sidebar-border flex flex-col shrink-0 transition-all duration-300">
      
      {/* Header da Sidebar - Branding Premium */}
      <div className="px-6 py-6 border-b border-sidebar-border flex items-center gap-3">
        <div className="bg-sidebar-primary p-2.5 rounded-lg shadow-sm">
          <Factory className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-base font-bold text-sidebar-foreground tracking-tight leading-tight">
            Lean Consulting
          </h1>
          <span className="text-[10px] font-semibold text-sidebar-foreground/50 uppercase tracking-wider mt-0.5">
            Engenharia de Produção
          </span>
        </div>
      </div>

      {/* Navegação */}
      <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 mb-3 text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-wider">
          Módulos de Análise
        </div>
        
        {modules.map(m => {
          const isActive = active === m.key;
          return (
            <button
              key={m.key}
              onClick={() => onSelect(m.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <m.icon className={`h-4 w-4 shrink-0 transition-opacity ${isActive ? "opacity-100" : "opacity-60"}`} />
              <span>{m.label}</span>
            </button>
          );
        })}
      </nav>

    </aside>
  );
}
