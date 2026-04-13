import { Download, Upload, LayoutDashboard, Printer } from "lucide-react";
import { useRef } from "react";

interface Props {
  onExport: () => void;
  onImport: (file: File) => void;
  onPDF: () => void;
}

export function Topbar({ onExport, onImport, onPDF }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    // A classe print:hidden garante que este menu suma quando o PDF for gerado
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 sticky top-0 z-10 shadow-sm print:hidden">
      
      {/* Título e Identidade Visual */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-blue-600 text-white shadow-sm">
          <LayoutDashboard className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider leading-tight">
            Painel de Gestão
          </h2>
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mt-0.5">
            Indicadores de Performance
          </p>
        </div>
      </div>
      
      {/* Ações e Controles */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center justify-center h-9 px-4 rounded-md text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
        >
          <Upload className="h-4 w-4 mr-2 text-slate-500" /> 
          Importar
        </button>
        
        <button 
          onClick={onExport}
          className="inline-flex items-center justify-center h-9 px-4 rounded-md text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
        >
          <Download className="h-4 w-4 mr-2 text-slate-500" /> 
          Backup
        </button>
        
        <input 
          ref={fileRef} 
          type="file" 
          accept=".json" 
          className="hidden" 
          onChange={e => {
            const f = e.target.files?.[0];
            if (f) onImport(f);
            // Reseta o input para permitir importar o mesmo arquivo novamente se houver erro
            e.target.value = "";
          }} 
        />
        
        <div className="h-6 w-px bg-slate-200 mx-1"></div>
        
        <button 
          onClick={onPDF}
          className="inline-flex items-center justify-center h-9 px-4 rounded-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Printer className="h-4 w-4 mr-2 opacity-90" /> 
          Exportar PDF
        </button>
      </div>
    </header>
  );
}
