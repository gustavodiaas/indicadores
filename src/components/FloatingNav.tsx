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
  Square 
} from "lucide-react";

interface Props {
  active: ModuleKey;
  onSelect: (k: ModuleKey) => void;
}

export function FloatingNav({ active, onSelect }: Props) {
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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 print:hidden max-w-[95vw]">
      <div className="flex items-center gap-1.5 px-3 py-2 bg-white/90 backdrop-blur-md border border-slate-200 shadow-xl rounded-2xl overflow-x-auto no-scrollbar">
        
        {navItems.map((item) => {
          const isActive = active === item.key;
          const Icon = item.icon;
          
          return (
            <button
              key={item.key}
              onClick={() => onSelect(item.key)}
              className={`
                group relative px-2 py-2.5 min-w-[80px] rounded-xl transition-all duration-300 ease-out flex flex-col items-center justify-center gap-1.5 flex-shrink-0
                ${isActive 
                  ? `${item.color} text-white scale-105 shadow-lg` 
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                }
              `}
            >
              <Icon className={`w-6 h-6 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
              <span className={`text-[10px] font-bold tracking-wide ${isActive ? "text-white" : "text-slate-500"}`}>
                {item.label}
              </span>
            </button>
          );
        })}
        
      </div>
    </div>
  );
}
