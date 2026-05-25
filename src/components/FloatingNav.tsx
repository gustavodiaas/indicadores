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
  const navItems: { key: ModuleKey; icon: any; label: string }[] = [
    { key: "home", icon: Home, label: "Home" },
    { key: "resumo", icon: FileText, label: "Resumo" },
    { key: "gbo", icon: GanttChartSquare, label: "GBO" },
    { key: "produtividade", icon: BarChart2, label: "Produtividade" },
    { key: "payback", icon: Calculator, label: "Payback" },
    { key: "movimentacao", icon: ArrowRightLeft, label: "Movimentação" },
    { key: "qualidade", icon: ShieldCheck, label: "Qualidade" },
    { key: "disponibilidade", icon: Clock, label: "Disponibilidade" },
    { key: "leadtime", icon: Timer, label: "Lead Time" },
    { key: "area", icon: Square, label: "Área" },
    { key: "planoAcao", icon: ClipboardList, label: "5W2H" },
    { key: "a3", icon: LayoutTemplate, label: "A3" },
  ];

  return (
    <div className="fixed z-[100] print:hidden left-1/2 -translate-x-1/2 bottom-6 w-[95%] md:w-max">
      {/* Efeito Glassmorphism: Fundo escuro translúcido + Blur */}
      <div className="flex flex-row items-center bg-[#0F172A]/90 backdrop-blur-xl border border-white/10 shadow-2xl shadow-slate-900/20 px-3 py-2 rounded-[3rem] gap-1">
        {navItems.map((item) => {
          const isActive = active === item.key;
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => onSelect(item.key)}
              className={`
                group transition-all duration-300 flex flex-col items-center justify-center gap-1 h-14 w-14 rounded-full
                ${isActive 
                  ? "bg-[#0057FF] text-white shadow-lg" 
                  : "text-slate-400 hover:text-white hover:bg-white/10"
                }
              `}
            >
              <Icon className="w-5 h-5" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
