import { useState } from "react";
import { ModuleKey } from "@/store/useAppStore";
import { 
  FileText, 
  GanttChartSquare, 
  BarChart2, 
  Calculator, 
  ArrowRightLeft, 
  ShieldCheck, 
  Clock, 
  Timer, 
  Square,
  Pin,
  PinOff
} from "lucide-react";

interface Props {
  active: ModuleKey;
  onSelect: (k: ModuleKey) => void;
}

export function FloatingNav({ active, onSelect }: Props) {
  const [isFixed, setIsFixed] = useState(false);

  const navItems: { key: ModuleKey; icon: any; label: string; color: string }[] = [
    { key: "resumo", icon: FileText, label: "Resumo", color: "bg-blue-600" },
    { key: "gbo", icon: GanttChartSquare, label: "GBO", color: "bg-indigo-600" },
    { key: "produtividade", icon: BarChart2, label: "Produtividade", color: "bg-emerald-600" },
    { key: "payback", icon: Calculator, label: "Payback", color: "bg-amber-500" },
    { key: "movimentacao", icon: ArrowRightLeft, label: "Movimentação", color: "bg-orange-500" },
    { key: "qualidade", icon: ShieldCheck, label: "Qualidade", color: "bg-rose-600" },
    { key: "disponibilidade", icon: Clock, label: "Disponibilidade", color: "bg-cyan-600" },
    { key: "leadtime", icon: Timer, label: "Lead Time", color: "bg-purple-600" },
    { key: "area", icon: Square, label: "Área", color: "bg-slate-600" },
  ];

  return (
    <div className={`
      fixed z-[100] transition-all duration-500 print:hidden
      ${isFixed 
        ? "left-0 top-0 h-full w-28" 
        : "left-6 top-1/2 -translate-y-1/2 w-28"
      }
    `}>
      <div className={`
        flex flex-col items-center gap-2 py-4 bg-white border border-slate-200 shadow-2xl transition-all duration-500
        ${isFixed ? "h-full rounded-none border-y-0 border-l-0" : "rounded-[3rem]"}
      `}>
        
        {/* BOTÃO PARA FIXAR / FLUTUAR */}
        <button 
          onClick={() => setIsFixed(!isFixed)}
          className={`
            p-2 mb-2 rounded-full transition-colors
            ${isFixed ? "text-blue-600 bg-blue-50" : "text-slate-300 hover:text-slate-500"}
          `}
        >
          {isFixed ? <Pin className="w-4 h-4 rotate-45" /> : <PinOff className="w-4 h-4" />}
        </button>

        <div className="flex-1 flex flex-col gap-2 overflow-y-auto no-scrollbar w-full px-2">
          {navItems.map((item) => {
            const isActive = active === item.key;
            const Icon = item.icon;
            
            return (
              <button
                key={item.key}
                onClick={() => onSelect(item.key)}
                className={`
                  group relative w-full h-20 rounded-2xl transition-all duration-300 flex flex-col items-center justify-center flex-shrink-0 gap-1
                  ${isActive 
                    ? `${item.color} text-white scale-105 shadow-md` 
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                  }
                `}
              >
                <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? "scale-100" : "group-hover:scale-110"}`} />
                <span className={`text-[9px] font-bold text-center leading-tight px-1 ${isActive ? "text-white" : "text-slate-500"}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
