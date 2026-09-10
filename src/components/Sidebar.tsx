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
  const [isExpanded, setIsExpanded] = useState(false);

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
  className={`fixed left-2 top-2 bottom-2 z-[1000] print:hidden flex flex-col
    h-[calc(100vh-16px)]
    bg-white/40 dark:bg-[#001833]/45
    backdrop-blur-xl backdrop-saturate-150
    border border-white/60 dark:border-[#4A6FA5]/30
    rounded-2xl shadow-lg
    transition-[width] duration-300 ease-in-out
    ${isExpanded ? "w-64" : "w-[64px]"}`}
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
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400
hover:text-[#002D72] dark:hover:text-white
hover:bg-white/50 dark:hover:bg-[#002D72]/30
transition-all duration-200 mx-auto"
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
  group w-full flex items-center gap-3
  px-2.5 py-2.5 rounded-xl
  transition-all duration-200
  ${isActive 
    ? "bg-[#FF6B00]/90 text-white shadow-md shadow-orange-500/20 font-bold" 
    : "text-slate-600 dark:text-slate-300 hover:text-[#002D72] dark:hover:text-white hover:bg-white/45 dark:hover:bg-[#002D72]/25 font-medium"
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
