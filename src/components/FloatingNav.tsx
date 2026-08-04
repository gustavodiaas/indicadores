import { ModuleKey } from "@/store/useAppStore";
import { 
  FileText, GanttChartSquare, BarChart2, Calculator, 
  ArrowRightLeft, ShieldCheck, Clock, Timer, Square, Home, ClipboardList, LayoutTemplate, BookOpen
} from "lucide-react";

interface Props {
  active: ModuleKey;
  onSelect: (k: ModuleKey) => void;
}

export function FloatingNav({ active, onSelect }: Props) {
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
    { key: "manual", icon: BookOpen, label: "Manual" },
  ];

  return (
    <div className="fixed z-[100] transition-all duration-500 print:hidden left-1/2 -translate-x-1/2 bottom-6 w-[95%] md:w-max">
      {/* Efeito Glassmorphism adaptado para os dois modos */}
      <div className="flex flex-row items-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/40 dark:border-slate-800/40 shadow-2xl transition-all duration-500 overflow-x-auto [&::-webkit-scrollbar]:hidden px-3 py-3 rounded-[3rem] gap-1.5 md:gap-2">
        {navItems.map((item) => {
          const isActive = active === item.key;
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => onSelect(item.key)}
              className={`
                group transition-all duration-300 flex flex-col items-center justify-center flex-shrink-0 gap-1.5 h-16 w-16 rounded-[2rem]
                ${isActive 
                  ? "bg-[#0057FF] text-white shadow-lg scale-105" 
                  : "text-slate-500 dark:text-slate-400 hover:text-[#0057FF] dark:hover:text-[#0057FF] hover:bg-[#0057FF]/10 dark:hover:bg-slate-800/50"
                }
              `}
            >
              <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? "" : "group-hover:scale-110"}`} />
              <span className="text-[9px] font-bold text-center leading-none px-0.5">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
