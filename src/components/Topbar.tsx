import { FileText, TrendingUp, ShieldAlert } from "lucide-react";

interface Props {
  onExportWord: () => void;
}

export function Topbar({ onExportWord }: Props) {
  return (
    /* Container externo apenas para centralizar e dar margem no topo */
    <div className="w-full pt-6 px-4 mb-4 flex justify-center print:hidden">
      
      {/* A Pílula Fluída */}
      <header className="w-full max-w-[1400px] h-16 bg-white/90 backdrop-blur-md border border-slate-200/60 shadow-xl shadow-slate-200/40 rounded-full px-8 flex items-center justify-between transition-all duration-500 hover:shadow-2xl hover:border-blue-200/50">
        
        {/* LOGO E TÍTULO */}
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-1.5 rounded-lg shadow-sm rotate-3 group-hover:rotate-0 transition-transform">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xs font-black text-slate-800 uppercase tracking-tighter leading-none">
              Consultoria Lean
            </h1>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5">
              Análise de Indicadores
            </span>
          </div>
        </div>

        {/* BOTÕES DE AÇÃO */}
        <div className="flex items-center gap-4">
          
          {/* LGPD (Visual Clean) */}
          <div className="relative group inline-block">
            <div className="flex items-center gap-2 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-slate-400 hover:text-blue-600 cursor-help transition-colors rounded-full">
              <ShieldAlert className="w-3.5 h-3.5" />
              Privacidade
            </div>
            
            {/* Tooltip do LGPD */}
            <div className="absolute top-full right-0 mt-4 w-[320px] p-6 bg-slate-900 text-slate-300 text-[11px] rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 border border-slate-800 z-[60]">
              <h4 className="font-bold text-white mb-3 uppercase tracking-widest text-[10px] border-b border-white/10 pb-2">Segurança de Dados</h4>
              <p className="leading-relaxed mb-3">Processamento <b>100% local</b>. Seus dados não saem deste computador.</p>
              <p className="text-blue-300 font-bold">Nenhum dado é enviado a servidores externos.</p>
            </div>
          </div>

          {/* DIVISOR */}
          <div className="h-4 w-px bg-slate-200" />

          {/* BOTÃO EXPORTAR (Pílula dentro da pílula) */}
          <button 
            onClick={onExportWord} 
            className="flex items-center gap-2 px-6 py-2 text-[10px] font-bold bg-slate-900 text-white hover:bg-blue-600 rounded-full transition-all shadow-md active:scale-95 uppercase tracking-widest"
          >
            <FileText className="h-3.5 w-3.5" /> 
            Exportar Word
          </button>

        </div>
      </header>
    </div>
  );
}
