import { 
  BarChart3, Calculator, ArrowRightLeft, ShieldCheck, 
  Clock, Timer, Square, FileText, LayoutDashboard
} from "lucide-react";
import { type ModuleKey } from "@/store/useAppStore";

const modules: { key: ModuleKey; label: string; icon: React.ElementType }[] = [
  { key: "resumo", label: "Resumo", icon: FileText },
  { key: "gbo", label: "GBO", icon: LayoutDashboard },
  { key: "produtividade", label: "Produção", icon: BarChart3 },
  { key: "payback", label: "Payback", icon: Calculator },
  { key: "movimentacao", label: "Logística", icon: ArrowRightLeft },
  { key: "qualidade", label: "Qualidade", icon: ShieldCheck },
  { key: "disponibilidade", label: "Disp.", icon: Clock },
  { key: "leadtime", label: "Lead Time", icon: Timer },
  { key: "area", label: "Área", icon: Square },
];

interface Props {
  active: ModuleKey;
  onSelect: (key: ModuleKey) => void;
}

export function FloatingNav({ active, onSelect }: Props) {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-fit">
      <nav className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md p-2 rounded-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
        {modules.map(m => {
          const isActive = active === m.key;
          return (
            <button
              key={m.key}
              onClick={() => onSelect(m.key)}
              className={`group relative flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${
                isActive 
                  ? "bg-blue-600 text-white shadow-lg" 
                  : "text-slate-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              <m.icon className="h-5 w-5" />
              
              {/* Tooltip flutuante */}
              <div className="absolute -top-12 scale-0 group-hover:scale-100 transition-all duration-200 pointer-events-none">
                <div className="bg-slate-800 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg border border-slate-700 uppercase tracking-widest whitespace-nowrap shadow-xl">
                  {m.label}
                </div>
                {/* Triângulo do tooltip */}
                <div className="w-2 h-2 bg-slate-800 border-r border-b border-slate-700 rotate-45 mx-auto -mt-1" />
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
