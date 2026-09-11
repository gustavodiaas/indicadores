"use client"

import {
  BarChart3, Calculator, ArrowLeftRight, ShieldCheck,
  Clock, Timer, Square, FileText, Factory
} from "lucide-react";
import { type ModuleKey } from "@/store/useAppStore";

const modules: { key: ModuleKey; label: string; icon: React.ElementType }[] = [
  { key: "resumo", label: "Descrição do Processo", icon: FileText },
  { key: "produtividade", label: "Produtividade", icon: BarChart3 },
  { key: "payback", label: "Payback", icon: Calculator },
  { key: "movimentacao", label: "Movimentação", icon: ArrowLeftRight },
  { key: "qualidade", label: "Qualidade", icon: ShieldCheck },
  { key: "disponibilidade", label: "Disponibilidade", icon: Clock },
  { key: "leadtime", label: "Lead Time", icon: Timer },
  { key: "area", label: "Área", icon: Square },
];

interface Props {
  active: ModuleKey;
  onSelect: (key: ModuleKey) => void;
}

export function AppSidebar({ active, onSelect }: Props) {
  return (
    <aside className="print:hidden w-64 min-h-screen bg-white border-r border-slate-100 flex flex-col shrink-0 transition-all duration-300">
      
      {/* Header */}
      <div className="px-6 py-8 border-b border-slate-50 flex items-center gap-3">
        <div className="bg-[#7C3AED] p-2.5 rounded-xl shadow-sm">
          <Factory className="h-5 w-5 text-white" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-sm font-bold text-slate-800 uppercase tracking-tight leading-tight">
            Consultoria Lean
          </h1>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            Análise de Indicadores
          </span>
        </div>
      </div>

      {/* Navegação */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 mb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Menu de Análise
        </div>
        
        {modules.map(m => {
          const isActive = active === m.key;
          return (
            <button
              key={m.key}
              onClick={() => onSelect(m.key)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-[#7C3AED] text-white shadow-md shadow-purple-200"
                  : "text-slate-500 hover:bg-slate-50 hover:text-[#7C3AED]"
              }`}
            >
              <m.icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
              <span>{m.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-slate-50">
        <div className="bg-slate-50 rounded-xl p-3">
          <p className="text-[10px] text-slate-400 font-bold text-center uppercase tracking-widest">
            Sistema de Indicadores v1.0
          </p>
        </div>
      </div>

    </aside>
  );
}
