import { Download, Upload, FileText, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

interface Props {
  onExport: () => void;
  onImport: (file: File) => void;
  onPDF: () => void;
}

export function Topbar({ onExport, onImport, onPDF }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 sticky top-0 z-10 shadow-sm">
      
      {/* Título e Identidade Visual */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded bg-blue-50 text-blue-600 border border-blue-100">
          <FileText className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider leading-tight">
            Painel de Controle
          </h2>
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-widest mt-0.5">
            Projeto de Consultoria
          </p>
        </div>
      </div>
      
      {/* Ações e Controles */}
      <div className="flex items-center gap-3">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => fileRef.current?.click()}
          className="text-slate-600 border-slate-300 hover:bg-slate-50 hover:text-slate-900"
        >
          <Upload className="h-4 w-4 mr-2" /> Importar Dados
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onExport}
          className="text-slate-600 border-slate-300 hover:bg-slate-50 hover:text-slate-900"
        >
          <Download className="h-4 w-4 mr-2" /> Salvar Backup
        </Button>
        
        <input 
          ref={fileRef} 
          type="file" 
          accept=".json" 
          className="hidden" 
          onChange={e => {
            const f = e.target.files?.[0];
            if (f) onImport(f);
            e.target.value = ""; // Reseta o input para permitir importar o mesmo arquivo
          }} 
        />
        
        <div className="h-6 w-px bg-slate-200 mx-1"></div>
        
        <Button 
          size="sm" 
          onClick={onPDF}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-medium"
        >
          <Printer className="h-4 w-4 mr-2" /> Gerar Relatório
        </Button>
      </div>
    </header>
  );
}
