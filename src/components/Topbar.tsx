import { Download, Upload, FileDown, TrendingUp } from "lucide-react";

interface Props {
  onExport: () => void;
  onImport: (file: File) => void;
  onPDF: () => void;
}

export function Topbar({ onExport, onImport, onPDF }: Props) {
  return (
    <header className="h-20 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-40 px-8 flex items-center justify-between">
      
      {/* Branding agora na horizontal */}
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
        <button onClick={onExport} className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-lg transition-all border border-slate-200">
          <Download className="h-4 w-4" /> BACKUP
        </button>
        <label className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-lg transition-all border border-slate-200 cursor-pointer">
          <Upload className="h-4 w-4" /> IMPORTAR
          <input type="file" className="hidden" accept=".json" onChange={e => e.target.files?.[0] && onImport(e.target.files[0])} />
        </label>
        <button onClick={onPDF} className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-all shadow-md shadow-blue-200">
          <FileDown className="h-4 w-4" /> EXPORTAR PDF
        </button>
      </div>
    </header>
  );
}
