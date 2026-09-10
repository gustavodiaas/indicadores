import { FileText, BarChart3, ShieldAlert, Upload, Download } from "lucide-react";
import { useRef } from "react";
import { AppState } from "@/store/useAppStore";
import { toast } from "sonner";

interface Props {
  onExportWord: () => void;
  state: AppState;
  loadState: (data: AppState) => void;
}

export function Topbar({ onExportWord, state, loadState }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleExportLean = () => {
    try {
      const exportData = {
        resumo: state.resumo,
        produtividade: state.produtividade,
        payback: state.payback,
        area: state.area,
        movimentacao: state.movimentacao,
        disponibilidade: state.disponibilidade,
        qualidade: state.qualidade,
        leadtime: state.leadtime,
      };

      const json = JSON.stringify(exportData, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const nomeEmpresa = state.resumo?.nomeEmpresa?.trim().replace(/\s+/g, "_") || "Projeto";
      link.href = url;
      link.download = `${nomeEmpresa}.lean`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Projeto exportado com sucesso!");
    } catch (error: any) {
      toast.error(`Erro ao exportar: ${error?.message || "Falha desconhecida"}`);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsedData = JSON.parse(text);

      const newState = {
        ...state,
        resumo: { ...state.resumo, ...(parsedData?.resumo || {}) },
        produtividade: { ...state.produtividade, ...(parsedData?.produtividade || {}) },
        payback: { ...state.payback, ...(parsedData?.payback || {}) },
        movimentacao: { ...state.movimentacao, ...(parsedData?.movimentacao || {}) },
        qualidade: { ...state.qualidade, ...(parsedData?.qualidade || {}) },
        disponibilidade: { ...state.disponibilidade, ...(parsedData?.disponibilidade || {}) },
        leadtime: { ...state.leadtime, ...(parsedData?.leadtime || {}) },
        area: { ...state.area, ...(parsedData?.area || {}) },
      };

      loadState(newState as AppState);
      toast.success("Projeto importado com sucesso!");
    } catch (error: any) {
      console.error("ERRO DE IMPORTAÇÃO:", error);
      toast.error(`Erro na leitura: ${error?.message || "Falha desconhecida"}`);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full z-[100] print:hidden mb-4 shrink-0">
      
      <header className="w-full min-h-16 bg-white/75 dark:bg-[#1C1C1E]/[0.78] backdrop-blur-2xl border border-black/[0.06] dark:border-white/10 px-5 py-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl shadow-[0_8px_30px_rgba(15,23,42,0.06)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.22)] transition-colors duration-300">
        
        <div className="flex items-center gap-3">
          <div className="bg-[#FF6B00] p-2 rounded-[10px] shadow-[0_4px_12px_rgba(255,107,0,0.24)]">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-[15px] font-semibold text-slate-900 dark:text-slate-100 tracking-tight leading-none">
            Central de Indicadores
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          
          <div className="relative group inline-block">
            <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-help transition-colors rounded-[10px] hover:bg-black/[0.04] dark:hover:bg-white/10">
              <ShieldAlert className="w-4 h-4" />
              Privacidade
            </div>
            
            <div className="absolute top-full right-0 mt-3 w-[340px] p-5 bg-white/95 dark:bg-[#2C2C2E]/95 backdrop-blur-2xl text-slate-600 dark:text-slate-300 text-xs rounded-2xl shadow-[0_18px_50px_rgba(0,0,0,0.16)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-black/[0.06] dark:border-white/10 z-[110] pointer-events-none group-hover:pointer-events-auto">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-3 text-sm border-b border-black/[0.06] dark:border-white/10 pb-2 text-left">Aviso de privacidade</h4>
              
              <div className="text-justify space-y-3 font-normal normal-case">
                <p className="leading-relaxed">Esta aplicação realiza o processamento de dados de forma estritamente local. Os arquivos de exportação são lidos apenas na memória do seu navegador/computador para fins de cálculo e visualização.</p>
                <p className="leading-relaxed text-[#FF6B00] font-semibold">Nenhum dado pessoal ou empresarial é enviado, armazenado ou compartilhado com servidores externos.</p>
                <p className="leading-relaxed">Ao exportar arquivos, os dados são gerados diretamente no seu dispositivo. Você é o único responsável pela segurança e custódia dos documentos originais e gerados.</p>
              </div>
            </div>
          </div>

          <div className="hidden lg:block h-6 w-px bg-black/[0.06] dark:bg-white/10 mx-1" />

          <input
            type="file"
            accept=".lean,application/json"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            onClick={handleExportLean}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium bg-black/[0.04] dark:bg-white/[0.08] text-slate-700 dark:text-slate-200 hover:bg-black/[0.07] dark:hover:bg-white/[0.13] rounded-[10px] transition-colors active:scale-[0.98]"
          >
            <Download className="h-4 w-4" />
            Exportar Dados
          </button>

          <button 
            onClick={handleImportClick} 
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium bg-black/[0.04] dark:bg-white/[0.08] text-slate-700 dark:text-slate-200 hover:bg-black/[0.07] dark:hover:bg-white/[0.13] rounded-[10px] transition-colors active:scale-[0.98]"
          >
            <Upload className="h-4 w-4" /> 
            Importar Dados
          </button>

          <button 
            onClick={onExportWord} 
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold bg-[#FF6B00] text-white hover:bg-[#E85F00] rounded-[10px] transition-colors shadow-[0_4px_14px_rgba(255,107,0,0.24)] active:scale-[0.98]"
          >
            <FileText className="h-4 w-4" /> 
            Baixar Word
          </button>

        </div>
      </header>
    </div>
  );
}
