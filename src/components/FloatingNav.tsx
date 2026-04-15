import { useState } from "react";
import { ModuleKey } from "@/store/useAppStore";
import { 
  FileText, GanttChartSquare, BarChart2, Calculator, 
  ArrowRightLeft, ShieldCheck, Clock, Timer, Square, Pin, PinOff
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
      left-1/2 -translate-x-1/2 
      ${isFixed ? "bottom-0 w-full" : "bottom-6 w-[95%] md:w-max"}
    `}>
      <div className={`
        flex flex-row items-center bg-white border border-slate-200 shadow-2xl transition-all duration-500
        overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]
        ${isFixed ? "px-6 py-3 rounded-none border-x-0 border-b-0 justify-center gap-2" : "px-3 py-3 rounded-[3rem] gap-1.5 md:gap-2"}
      `}>
        
        {/* BOTÃO FIXAR */}
        <button 
          onClick={() => setIsFixed(!isFixed)}
          className={`
            p-2 rounded-full transition-colors flex-shrink-0
            ${isFixed ? "text-blue-600 bg-blue-50" : "text-slate-300 hover:text-slate-500"}
          `}
        >
          {isFixed ? <Pin className="w-4 h-4 rotate-45" /> : <PinOff className="w-4 h-4" />}
        </button>

        {/* DIVISOR */}
        <div className="w-px h-8 bg-slate-200 mx-1 flex-shrink-0"></div>

        {/* BOTÕES DE NAVEGAÇÃO */}
        {navItems.map((item) => {
          const isActive = active === item.key;
          const Icon = item.icon;
          
          return (
            <button
              key={item.key}
              onClick={() => onSelect(item.key)}
              className={`
                group relative transition-all duration-300 flex flex-col items-center justify-center flex-shrink-0 gap-1.5
                h-16 w-[72px] rounded-2xl
                ${isActive 
                  ? `${item.color} text-white scale-105 shadow-md` 
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                }
              `}
            >
              <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? "scale-100" : "group-hover:scale-110"}`} />
              <span className={`text-[9px] font-bold text-center leading-none px-1 ${isActive ? "text-white" : "text-slate-500"}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
