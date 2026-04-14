import { FileText, TrendingUp, ShieldAlert } from "lucide-react";

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

      <div className="flex items-center gap-4">
        
        {/* AVISO LGPD SUTIL (FORA DO BOTÃO DE EXPORTAR) */}
        <div className="relative group inline-block print:hidden z-50">
          <div className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-700 bg-transparent rounded-full hover:bg-slate-200/50 transition-colors cursor-help">
            <ShieldAlert className="w-4 h-4" />
            Privacidade e LGPD
          </div>
          
          {/* Painel Flutuante (Aparece no Hover) */}
          <div className="absolute top-full right-0 mt-2 w-[340px] p-5 bg-slate-900 text-slate-300 text-[11px] rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 border border-slate-700 text-justify cursor-default normal-case font-normal">
            <h4 className="font-bold text-white mb-3 uppercase tracking-widest text-[10px] border-b border-slate-700 pb-2">Aviso de Privacidade</h4>
            <p className="mb-2 leading-relaxed">Esta aplicação realiza o processamento de dados de forma estritamente local. Os arquivos de exportação são lidos apenas na memória do seu navegador/computador para fins de cálculo e visualização.</p>
            <p className="mb-2 leading-relaxed text-blue-300 font-bold">Nenhum dado pessoal ou empresarial é enviado, armazenado ou compartilhado com servidores externos.</p>
            <p className="leading-relaxed">Ao exportar arquivos, os dados são gerados diretamente no seu dispositivo. Você é o único responsável pela segurança e custódia dos documentos originais e gerados.</p>
          </div>
        </div>

        {/* BOTÃO EXPORTAR (LIMPO) */}
        <button 
          onClick={onExportWord} 
          className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 rounded-xl transition-all shadow-lg active:scale-95"
        >
          <FileText className="h-4 w-4" /> 
          EXPORTAR RELATÓRIO (WORD)
        </button>

      </div>
    </header>
  );
}
