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
      /* MOBILE: Barra horizontal no rodapé */
      bottom-4 left-1/2 -translate-x-1/2 w-[95%]
      /* DESKTOP/NOTEBOOK: Pílula vertical na esquerda */
      md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:left-6 md:-translate-x-0 md:w-24
      ${isFixed ? "md:left-0 md:top-0 md:h-full md:w-24" : ""}
    `}>
      <div className={`
        flex bg-white border border-slate-200 shadow-2xl transition-all duration-500
        /* MOBILE: Scroll horizontal escondido */
        flex-row items-center p-2 rounded-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]
        /* DESKTOP/NOTEBOOK: Organização vertical */
        md:flex-col md:py-4 md:gap-1 md:overflow-visible
        ${isFixed ? "md:rounded-none md:border-y-0 md:border-l-0" : "md:rounded-[2.5rem]"}
      `}>
        
        {/* BOTÃO FIXAR (Aparece apenas no Desktop) */}
        <div className="hidden md:flex justify-center w-full mb-1">
          <button 
            onClick={() => setIsFixed(!isFixed)}
            className={`p-1.5 rounded-full transition-colors ${isFixed ? "text-blue-600 bg-blue-50" : "text-slate-300 hover:text-slate-500"}`}
          >
            {isFixed ? <Pin className="w-3.5 h-3.5 rotate-45" /> : <PinOff className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="flex flex-row md:flex-col flex-1 gap-1 w-full px-1 md:px-2">
          {navItems.map((item) => {
            const isActive = active === item.key;
            const Icon = item.icon;
            
            return (
              <button
                key={item.key}
                onClick={() => onSelect(item.key)}
                className={`
                  group relative rounded-xl transition-all duration-300 flex flex-col items-center justify-center flex-shrink-0 gap-1
                  /* MOBILE: Botão menor e mais quadrado */
                  h-12 w-[60px]
                  /* DESKTOP/NOTEBOOK: Botão normal */
                  md:w-full md:h-14
                  ${isActive 
                    ? `${item.color} text-white scale-105 shadow-md` 
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                  }
                `}
              >
                <Icon className={`w-4 h-4 transition-transform duration-300 ${isActive ? "scale-100" : "group-hover:scale-110"}`} />
                <span className={`text-[8px] md:text-[8.5px] font-bold text-center leading-none px-1 ${isActive ? "text-white" : "text-slate-500"}`}>
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
