import { FileText, BarChart3, ShieldAlert } from "lucide-react";

interface Props {
  onExportWord: () => void;
}

export function Topbar({ onExportWord }: Props) {
  return (
    <div className="w-full mb-2 flex justify-center print:hidden relative z-[100]">
      
      <header className="w-full h-20 bg-white/95 backdrop-blur-md border border-slate-200/60 shadow-xl shadow-slate-200/30 rounded-full px-10 flex items-center justify-between transition-all duration-500 hover:shadow-2xl">
        
        {/* LOGO E TÍTULO UNIFICADO */}
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-2 rounded-xl shadow-sm">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.25em] leading-none">
            Central de Indicadores
          </h1>
        </div>

        {/* BOTÕES */}
        <div className="flex items-center gap-6">
          
          <div className="relative group inline-block">
            <div className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-blue-600 cursor-help transition-colors rounded-full">
              <ShieldAlert className="w-4 h-4" />
              Privacidade
            </div>
            
            <div className="absolute top-full right-0 mt-4 w-[340px] p-6 bg-slate-900 text-slate-300 text-[11px] rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 border border-slate-800 z-[110] pointer-events-none group-hover:pointer-events-auto">
              <h4 className="font-bold text-white mb-3 uppercase tracking-widest text-[10px] border-b border-white/10 pb-2 text-left">Aviso de Privacidade</h4>
              
              <div className="text-justify space-y-3 font-normal normal-case">
                <p className="leading-relaxed">Esta aplicação realiza o processamento de dados de forma estritamente local. Os arquivos de exportação são lidos apenas na memória do seu navegador/computador para fins de cálculo e visualização.</p>
                <p className="leading-relaxed text-blue-300 font-bold">Nenhum dado pessoal ou empresarial é enviado, armazenado ou compartilhado com servidores externos.</p>
                <p className="leading-relaxed">Ao exportar arquivos, os dados são gerados diretamente no seu dispositivo. Você é o único responsável pela segurança e custódia dos documentos originais e gerados.</p>
              </div>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-200" />

          <button 
            onClick={onExportWord} 
            className="flex items-center gap-2 px-8 py-3 text-[10px] font-bold bg-slate-900 text-white hover:bg-blue-600 rounded-full transition-all shadow-md active:scale-95 uppercase tracking-widest"
          >
            <FileText className="h-4 w-4" /> 
            Baixar Word
          </button>

        </div>
      </header>
    </div>
  );
}
