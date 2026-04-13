import {
  BarChart3, Calculator, ArrowRightLeft, ShieldCheck,
  Clock, Timer, Square, FileText, Factory
} from "lucide-react";
import { type ModuleKey } from "@/store/useAppStore";

const modules: { key: ModuleKey; label: string; icon: React.ElementType }[] = [
  { key: "resumo", label: "Descrição do Processo", icon: FileText },
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
    <aside className="print:hidden w-64 min-h-screen bg-[#0f172a] border-r border-slate-800 flex flex-col shrink-0 transition-all duration-300">
      
      {/* Header - Branding */}
      <div className="px-6 py-8 border-b border-slate-800 flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-lg shadow-lg">
          <Factory className="h-5 w-5 text-white" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-sm font-bold text-white uppercase tracking-wider leading-tight">
            Lean Consulting
          </h1>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
            Engenharia
          </span>
        </div>
      </div>

      {/* Navegação */}
      <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 mb-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          Menu de Análise
        </div>
        
        {modules.map(m => {
          const isActive = active === m.key;
          return (
            <button
              key={m.key}
              onClick={() => onSelect(m.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <m.icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-slate-500"}`} />
              <span>{m.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Rodapé da Sidebar */}
      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/50 rounded-lg p-3">
          <p className="text-[10px] text-slate-500 font-medium text-center uppercase tracking-tighter">
            Sistema de Indicadores v1.0
          </p>
        </div>
      </div>

    </aside>
  );
}
