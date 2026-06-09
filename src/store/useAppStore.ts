import { FileText, BarChart3, ShieldAlert, Upload } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";

interface Props {
  onExportWord: () => void;
}

export function Topbar({ onExportWord }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsedData = JSON.parse(text);
      
      const saved = localStorage.getItem("consultoria-lean-state");
      const current = saved ? JSON.parse(saved) : {};

      const newState = {
        ...current,
        resumo: { ...current.resumo, ...(parsedData?.resumo || {}) },
        produtividade: { ...current.produtividade, ...(parsedData?.produtividade || {}) },
        payback: { ...current.payback, ...(parsedData?.payback || {}) },
        movimentacao: { ...current.movimentacao, ...(parsedData?.movimentacao || {}) },
        qualidade: { ...current.qualidade, ...(parsedData?.qualidade || {}) },
        disponibilidade: { ...current.disponibilidade, ...(parsedData?.disponibilidade || {}) },
        leadtime: { ...current.leadtime, ...(parsedData?.leadtime || {}) },
        area: { ...current.area, ...(parsedData?.area || {}) }
      };

      localStorage.setItem("consultoria-lean-state", JSON.stringify(newState));

      toast.success("Projeto importado com sucesso!");
      
      setTimeout(() => {
        window.location.reload();
      }, 800);

    } catch (error: any) {
      console.error("ERRO DE IMPORTAÇÃO:", error);
      toast.error(`Erro na leitura: ${error?.message || "Falha desconhecida"}`);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full z-[100] print:hidden mb-6 shrink-0">
      
      <header className="w-full h-20 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/80 px-10 flex items-center justify-between transition-all duration-500">
        
        <div className="flex items-center gap-4">
          <div className="bg-[#0057FF] p-2 rounded-xl shadow-sm">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-[0.25em] leading-none">
            Central de Indicadores
          </h1>
        </div>

        <div className="flex items-center gap-6">
          
          <div className="relative group inline-block">
            <div className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-[#0057FF] dark:hover:text-[#0057FF] cursor-help transition-colors rounded-full">
              <ShieldAlert className="w-4 h-4" />
              Privacidade
            </div>
            
            <div className="absolute top-full right-0 mt-4 w-[340px] p-6 bg-slate-900 dark:bg-slate-950 text-slate-300 dark:text-slate-400 text-[11px] rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 border border-slate-800 dark:border-slate-800/60 z-[110] pointer-events-none group-hover:pointer-events-auto">
              <h4 className="font-bold text-white mb-3 uppercase tracking-widest text-[10px] border-b border-white/10 pb-2 text-left">Aviso de Privacidade</h4>
              
              <div className="text-justify space-y-3 font-normal normal-case">
                <p className="leading-relaxed">Esta aplicação realiza o processamento de dados de forma estritamente local. Os arquivos de exportação são lidos apenas na memória do seu navegador/computador para fins de cálculo e visualização.</p>
                <p className="leading-relaxed text-[#0057FF] font-bold">Nenhum dado pessoal ou empresarial é enviado, armazenado ou compartilhado com servidores externos.</p>
                <p className="leading-relaxed">Ao exportar arquivos, os dados são gerados diretamente no seu dispositivo. Você é o único responsável pela segurança e custódia dos documentos originais e gerados.</p>
              </div>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-100 dark:bg-slate-800" />

          <input
            type="file"
            accept=".lean"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          <button 
            onClick={handleImportClick} 
            className="flex items-center gap-2 px-6 py-3 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all shadow-sm active:scale-95 uppercase tracking-widest"
          >
            <Upload className="h-4 w-4" /> 
            Importar .lean
          </button>

          <button 
            onClick={onExportWord} 
            className="flex items-center gap-2 px-8 py-3 text-[10px] font-bold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-[#0057FF] dark:hover:bg-[#0057FF] dark:hover:text-white rounded-xl transition-all shadow-md active:scale-95 uppercase tracking-widest"
          >
            <FileText className="h-4 w-4" /> 
            Baixar Word
          </button>

        </div>
      </header>
    </div>
  );
}
