import { FileText, TrendingUp } from "lucide-react";

interface Props {
  onExportWord: () => void;
}

export function Topbar({ onExportWord }: Props) {
  return (
    <header className="h-20 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-40 px-8 flex items-center justify-between">
      
      <div className="flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-lg shadow-md">
          <TrendingUp className="h-5 w-5 text-white" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-sm font-black text-slate-800 uppercase tracking-tight leading-tight">
            Consultoria Lean
          </h1>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Análise de Indicadores
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={onExportWord} 
          className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 rounded-xl transition-all shadow-lg active:scale-95"
        >
          <FileText className="h-4 w-4" /> EXPORTAR RELATÓRIO (WORD)
        </button>
      </div>
    </header>
  );
}
