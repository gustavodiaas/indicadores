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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 print:hidden">
      
      {/* Fundo na cor do site (#F8FAFC) com borda sutil e sombra flutuante */}
      <div className="flex items-center gap-1.5 px-3 py-2 bg-[#F8FAFC] border border-slate-200 shadow-xl rounded-2xl">
        
        {navItems.map((item) => {
          const isActive = active === item.key;
          const Icon = item.icon;
          
          return (
            <button
              key={item.key}
              onClick={() => onSelect(item.key)}
              title={item.label}
              className={`
                relative p-3 rounded-xl transition-all duration-300 ease-out flex items-center justify-center
                ${isActive 
                  // Botão Ativo: Fica maior (scale-110), azul e com sombra própria
                  ? "bg-blue-600 text-white scale-110 shadow-md" 
                  // Botão Inativo: Cinza neutro. No hover: Cresce, fica azul e ganha fundo claro
                  : "text-slate-400 hover:text-blue-600 hover:bg-blue-50/50 hover:scale-110"
                }
              `}
            >
              <Icon className="w-5 h-5 transition-transform duration-300" />
            </button>
          );
        })}
        
      </div>
    </div>
  );
}
