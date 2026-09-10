import { useState } from "react";
import { ModuleKey } from "@/store/useAppStore";
import { 
  FileText, GanttChartSquare, BarChart2, Calculator, 
  ArrowRightLeft, ShieldCheck, Clock, Timer, Square, Home, ClipboardList, LayoutTemplate, Calendar, BookOpen, PanelLeftClose, PanelLeftOpen
} from "lucide-react";

interface Props {
  active: ModuleKey;
  onSelect: (k: ModuleKey) => void;
}

export function Sidebar({ active, onSelect }: Props) {
  const [isExpanded, setIsExpanded] = useState(true);

  const navItems: { key: ModuleKey; icon: any; label: string }[] = [
    { key: "home", icon: Home, label: "Home" },
    { key: "resumo", icon: FileText, label: "Resumo" },
    { key: "gbo", icon: GanttChartSquare, label: "GBO" },
    { key: "produtividade", icon: BarChart2, label: "Produtividade" },
    { key: "payback", icon: Calculator, label: "Payback" },
    { key: "movimentacao", icon: ArrowRightLeft, label: "Movimentação" },
    { key: "qualidade", icon: ShieldCheck, label: "Qualidade" },
    { key: "disponibilidade", icon: Clock, label: "Disp." },
    { key: "leadtime", icon: Timer, label: "Lead Time" },
    { key: "area", icon: Square, label: "Área" },
    { key: "planoAcao", icon: ClipboardList, label: "5W2H" },
    { key: "a3", icon: LayoutTemplate, label: "A3" },
    { key: "gantt", icon: Calendar, label: "Gantt" },
    { key: "manual", icon: BookOpen, label: "Manual" },
  ];

  return (
    <aside 
  className={`fixed left-0 top-0 bottom-0 z-[1000] print:hidden flex flex-col h-screen
    bg-white/35 dark:bg-[#001833]/40 backdrop-blur-2xl backdrop-saturate-150
    border-r border-white/50 dark:border-[#4A6FA5]/30 shadow-xl
    transition-[width] duration-300 ease-in-out
    ${isExpanded ? "w-64" : "w-[72px]"}`}
>
      {/* Botão de Expansão/Contração no Topo (Estilo Gemini) */}
      <div className="flex items-center justify-between px-4 h-20 border-b border-slate-200/40 dark:border-[#4A6FA5]/30 shrink-0">
        {isExpanded && (
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-800 dark:text-slate-200 truncate">
            Navegação
          </span>
        )}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-[#002D72] dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-[#002D72]/40 transition-colors mx-auto"
          title={isExpanded ? "Recuar barra lateral" : "Expandir barra lateral"}
        >
          {isExpanded ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
        </button>
      </div>

      {/* Lista de Módulos */}
      <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-[#4A6FA5]/40 [&::-webkit-scrollbar-thumb]:rounded-full">
        {navItems.map((item) => {
          const isActive = active === item.key;
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => onSelect(item.key)}
              title={!isExpanded ? item.label : undefined}
              className={`
                group w-full flex items-center gap-3.5 px-3 py-3 rounded-2xl transition-all duration-300
                ${isActive 
                  ? "bg-[#FF6B00] text-white shadow-lg shadow-orange-500/20 font-bold scale-[1.02]" 
                  : "text-slate-600 dark:text-slate-300 hover:text-[#002D72] dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-[#002D72]/30 font-medium"
                }
              `}
            >
              <div className="shrink-0 flex items-center justify-center w-6 h-6">
                <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? "" : "group-hover:scale-110"}`} />
              </div>
              
              {isExpanded && (
                <span className="text-xs truncate tracking-wide text-left">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
