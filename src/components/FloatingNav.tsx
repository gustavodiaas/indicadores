import { ModuleKey } from "@/store/useAppStore";
import { FileText, LayoutGrid, BarChart2, Calculator, ArrowRightLeft, ShieldCheck, Clock, Timer, Square } from "lucide-react";

interface Props {
  active: ModuleKey;
  onSelect: (k: ModuleKey) => void;
}

export function FloatingNav({ active, onSelect }: Props) {
  const navItems: { key: ModuleKey; icon: any; label: string }[] = [
    { key: "resumo", icon: FileText, label: "Resumo" },
    { key: "gbo", icon: LayoutGrid, label: "GBO" },
    { key: "produtividade", icon: BarChart2, label: "Produtividade" },
    { key: "payback", icon: Calculator, label: "Payback" },
    { key: "movimentacao", icon: ArrowRightLeft, label: "Movimentação" },
    { key: "qualidade", icon: ShieldCheck, label: "Qualidade" },
    { key: "disponibilidade", icon: Clock, label: "Disponibilidade" },
    { key: "leadtime", icon: Timer, label: "Lead Time" },
    { key: "area", icon: Square, label: "Área" },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 print:hidden max-w-[95vw]">
      
      {/* Fundo integrado. Adicionado overflow para evitar quebra em telas menores */}
      <div className="flex items-center gap-1.5 px-3 py-2 bg-[#F8FAFC] border border-slate-200 shadow-xl rounded-2xl overflow-x-auto no-scrollbar">
        
        {navItems.map((item) => {
          const isActive = active === item.key;
          const Icon = item.icon;
          
          return (
            <button
              key={item.key}
              onClick={() => onSelect(item.key)}
              title={item.label}
              className={`
                group relative px-2 py-2.5 min-w-[76px] rounded-xl transition-all duration-300 ease-out flex flex-col items-center justify-center gap-1.5 flex-shrink-0
                ${isActive 
                  ? "bg-blue-600 text-white scale-105 shadow-md" 
                  : "text-slate-400 hover:text-blue-600 hover:bg-blue-50/50 hover:scale-105"
                }
              `}
            >
              {/* Ícone com zoom (tamanho 6) */}
              <Icon className="w-6 h-6 transition-transform duration-300" />
              
              {/* Nome da aba embaixo */}
              <span className="text-[10px] font-bold tracking-wide">
                {item.label}
              </span>
            </button>
          );
        })}
        
      </div>
    </div>
  );
}
