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
      className={`fixed left-3 top-3 bottom-3 z-[1000] print:hidden flex flex-col
        h-[calc(100vh-24px)]
        bg-white/75 dark:bg-[#1C1C1E]/[0.78]
        backdrop-blur-2xl backdrop-saturate-150
        border border-black/[0.06] dark:border-white/10
        rounded-[20px] shadow-[0_12px_40px_rgba(15,23,42,0.10)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.32)]
        transition-[width] duration-300 ease-out
        ${isExpanded ? "w-60" : "w-[60px]"}`}
    >
      {/* Botão de Expansão/Contração no Topo (Estilo Gemini) */}
      <div className="flex items-center justify-between px-3 h-16 border-b border-black/[0.05] dark:border-white/10 shrink-0">
        {isExpanded && (
          <span className="text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-100 truncate">
            Navegação
          </span>
        )}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-[10px] text-slate-500 dark:text-slate-400
hover:text-slate-900 dark:hover:text-white
hover:bg-black/[0.05] dark:hover:bg-white/10
transition-colors duration-200 mx-auto"
          title={isExpanded ? "Recuar barra lateral" : "Expandir barra lateral"}
        >
          {isExpanded ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
        </button>
      </div>

      {/* Lista de Módulos */}
      <nav className="flex-1 py-3 px-2.5 space-y-1 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full">
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
  px-2 py-2 rounded-[12px]
  transition-colors duration-200
  ${isActive 
    ? "bg-[#FF6B00] text-white shadow-[0_4px_14px_rgba(255,107,0,0.28)] font-semibold" 
    : "text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/10 font-medium"
  }
`}
            >
              <div className="shrink-0 flex items-center justify-center w-6 h-6">
                <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? "" : "group-hover:scale-110"}`} />
              </div>
              
              {isExpanded && (
                <span className="text-[13px] truncate tracking-tight text-left">
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
