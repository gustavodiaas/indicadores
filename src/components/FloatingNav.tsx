import { ModuleKey } from "@/store/useAppStore";
import { 
  FileText, GanttChartSquare, BarChart2, Calculator, 
  ArrowRightLeft, ShieldCheck, Clock, Timer, Square, Home, ClipboardList, LayoutTemplate
} from "lucide-react";

interface Props {
  active: ModuleKey;
  onSelect: (k: ModuleKey) => void;
}

export function FloatingNav({ active, onSelect }: Props) {
  const navItems: { key: ModuleKey; icon: any; label: string; color: string }[] = [
    { key: "home", icon: Home, label: "Home", color: "bg-slate-900" },
    { key: "resumo", icon: FileText, label: "Resumo", color: "bg-blue-600" },
    { key: "gbo", icon: GanttChartSquare, label: "GBO", color: "bg-indigo-600" },
    { key: "produtividade", icon: BarChart2, label: "Produtividade", color: "bg-emerald-600" },
    { key: "payback", icon: Calculator, label: "Payback", color: "bg-amber-500" },
    { key: "movimentacao", icon: ArrowRightLeft, label: "Movimentação", color: "bg-orange-500" },
    { key: "qualidade", icon: ShieldCheck, label: "Qualidade", color: "bg-rose-600" },
    { key: "disponibilidade", icon: Clock, label: "Disponibilidade", color: "bg-cyan-600" },
    { key: "leadtime", icon: Timer, label: "Lead Time", color: "bg-purple-600" },
    { key: "area", icon: Square, label: "Área", color: "bg-slate-600" },
    { key: "planoAcao", icon: ClipboardList, label: "5W2H", color: "bg-sky-600" },
    { key: "a3", icon: LayoutTemplate, label: "A3", color: "bg-indigo-500" },
  ];

  return (
    <div className="fixed z-[100] transition-all duration-500 print:hidden left-1/2 -translate-x-1/2 bottom-6 w-[95%] md:w-max">
      <div className="flex flex-row items-center bg-white/60 backdrop-blur-md border border-white/20 shadow-2xl transition-all duration-500 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-3 py-3 rounded-[3rem] gap-1.5 md:gap-2">
        {navItems.map((item) => {
          const isActive = active === item.key;
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => onSelect(item.key)}
              className={`
                group relative transition-all duration-300 flex flex-col items-center justify-center flex-shrink-0 gap-1.5 h-16 w-16
                ${isActive 
                  ? `${item.color} text-white scale-105 shadow-md rounded-full` 
                  : "text-slate-500/70 hover:text-slate-700 hover:bg-white/30 rounded-2xl"
                }
              `}
            >
              <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? "scale-100" : "group-hover:scale-110"}`} />
              <span className={`text-[9px] font-bold text-center leading-none px-0.5 ${isActive ? "text-white" : "text-slate-600"}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
