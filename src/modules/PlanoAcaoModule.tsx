import { type PlanoAcaoData, type PlanoAcaoItem } from "@/store/useAppStore";
import { InputField } from "@/components/InputField";
import { Trash2, Download, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

interface Props {
  data: PlanoAcaoData;
  onChange: (d: Partial<PlanoAcaoData>) => void;
}

export function PlanoAcaoModule({ data, onChange }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const updateMeta = (field: keyof typeof data.metadata, value: string) => {
    onChange({ metadata: { ...data.metadata, [field]: value } });
  };

  const updateAcao = (id: string, field: keyof PlanoAcaoItem, value: any) => {
    const novasAcoes = data.acoes.map(a => a.id === id ? { ...a, [field]: value } : a);
    onChange({ acoes: novasAcoes });
  };

  const handleRemoveAcao = (id: string) => {
    onChange({ acoes: data.acoes.filter(a => a.id !== id) });
  };

  const handleExportExcel = () => {
    if (data.acoes.length === 0) {
      toast.error("Adicione ações antes de exportar.");
      return;
    }

    const m = data.metadata;
    const wsData = [
      [],
      [],
      ["Data da criação do plano:", m.dataCriacao || "", "", "Responsável:", m.respCriacao || "", "", "Objetivo:", m.objetivo || "", "", "Meta:", m.meta || ""],
      ["Data da revisão do plano:", m.dataRevisao || "", "", "Responsável:", m.respRevisao || "", "", "Indicador:", m.indicador || ""],
      [],
      ["", "", "", "Quando", "", "", "", "", "", "", "", ""],
      ["O que", "Como", "Quem", "Início", "Fim", "Onde", "Por que", "Quanto", "% Completo", "Hoje", "Observação", "STATUS"],
      ...data.acoes.map(a => [
        a.what, 
        a.how || "", 
        a.who || "", 
        a.start || "", 
        a.end || "", 
        a.where || "", 
        a.why || "", 
        a.howMuch || "0", 
        a.percent ? (a.percent / 100) : 0, 
        "", // Hoje em branco por padrão
        a.obs || "", 
        a.status || "NÃO INICIADO"
      ])
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "5W2H");
    XLSX.writeFile(wb, "Plano_de_Acao_5W2H.xlsx");
    toast.success("Excel exportado com sucesso!");
  };

  return (
    <div className="flex flex-col gap-6 h-full pb-36 animate-in fade-in duration-500 overflow-y-auto pr-2">
      
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-sky-500" /> PLANO DE AÇÃO 5W2H
          </h2>
          <p className="text-sm text-slate-500 mt-1">Gerenciamento tático e detalhamento das ações corretivas.</p>
        </div>
        <button 
          onClick={handleExportExcel}
          className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-bold text-xs uppercase tracking-widest shadow-md hover:bg-emerald-700 transition-all active:scale-95"
        >
          <Download className="h-4 w-4" /> Exportar Planilha
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-800 uppercase text-[11px] tracking-widest mb-4 border-b pb-2">Metadados do Projeto</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <InputField label="Data de Criação" value={data.metadata.dataCriacao} onChange={v => updateMeta("dataCriacao", v)} type="date" />
          <InputField label="Responsável" value={data.metadata.respCriacao} onChange={v => updateMeta("respCriacao", v)} />
          <InputField label="Objetivo" value={data.metadata.objetivo} onChange={v => updateMeta("objetivo", v)} />
          <InputField label="Meta" value={data.metadata.meta} onChange={v => updateMeta("meta", v)} />
          
          <InputField label="Data de Revisão" value={data.metadata.dataRevisao} onChange={v => updateMeta("dataRevisao", v)} type="date" />
          <InputField label="Responsável (Revisão)" value={data.metadata.respRevisao} onChange={v => updateMeta("respRevisao", v)} />
          <div className="md:col-span-2"><InputField label="Indicador" value={data.metadata.indicador} onChange={v => updateMeta("indicador", v)} /></div>
        </div>
      </div>

      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm flex-1">
        <h3 className="font-bold text-slate-800 uppercase text-[11px] tracking-widest mb-4 flex items-center gap-2">
          Execução de Tarefas 
          <span className="bg-sky-200 text-sky-700 px-2 py-0.5 rounded-full text-[10px]">{data.acoes.length}</span>
        </h3>

        {data.acoes.length === 0 ? (
           <div className="flex flex-col items-center justify-center p-12 text-slate-400 border-2 border-dashed border-slate-300 rounded-xl bg-white">
             <CheckCircle className="h-12 w-12 mb-4 opacity-50" />
             <p className="text-sm font-bold">Nenhuma ação vinculada.</p>
             <p className="text-xs mt-1">Adicione as macros através da aba "Resumo".</p>
           </div>
        ) : (
          <div className="flex flex-col gap-3">
            {data.acoes.map(a => (
              <div key={a.id} className="border border-slate-300 rounded-xl bg-white shadow-sm overflow-hidden transition-all duration-300">
                <div 
                  className="flex items-center justify-between p-4 bg-white hover:bg-slate-50 cursor-pointer select-none transition-colors border-b border-transparent"
                  onClick={() => setExpandedId(expandedId === a.id ? null : a.id)}
                >
                  <div className="flex flex-col flex-1 pr-4">
                    <span className="text-sm font-black text-slate-800 truncate">{a.what}</span>
                    <span className="text-xs text-slate-500 font-medium mt-0.5">Status: <span className="text-sky-600">{a.status || "NÃO INICIADO"}</span> • Progresso: {a.percent || 0}%</span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {expandedId === a.id ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleRemoveAcao(a.id); }}
                      className="p-2 hover:bg-rose-100 rounded-md transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-rose-500" />
                    </button>
                  </div>
                </div>

                {expandedId === a.id && (
                  <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 border-t border-slate-200 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="md:col-span-4"><InputField label="O que será feito? (What)" value={a.what} onChange={v => updateAcao(a.id, "what", v)} /></div>
                    <div className="md:col-span-2"><InputField label="Como? (How)" value={a.how} onChange={v => updateAcao(a.id, "how", v)} /></div>
                    <InputField label="Por que? (Why)" value={a.why} onChange={v => updateAcao(a.id, "why", v)} />
                    <InputField label="Onde? (Where)" value={a.where} onChange={v => updateAcao(a.id, "where", v)} />
                    
                    <InputField label="Quem? (Who)" value={a.who} onChange={v => updateAcao(a.id, "who", v)} />
                    <InputField label="Início (When)" value={a.start} onChange={v => updateAcao(a.id, "start", v)} type="date" />
                    <InputField label="Fim (When)" value={a.end} onChange={v => updateAcao(a.id, "end", v)} type="date" />
                    <InputField label="Quanto Custa? (How Much)" value={a.howMuch} onChange={v => updateAcao(a.id, "howMuch", v)} />
                    
                    <InputField label="% Completo" value={a.percent} onChange={v => updateAcao(a.id, "percent", Number(v) || 0)} type="number" />
                    <div className="md:col-span-2"><InputField label="Observação" value={a.obs} onChange={v => updateAcao(a.id, "obs", v)} /></div>
                    
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Status</label>
                      <select 
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-sky-500"
                        value={a.status || "NÃO INICIADO"}
                        onChange={(e) => updateAcao(a.id, "status", e.target.value)}
                      >
                        <option value="NÃO INICIADO">Não Iniciado</option>
                        <option value="INICIADO">Iniciado</option>
                        <option value="EM ANDAMENTO">Em Andamento</option>
                        <option value="REJEITADO">Rejeitado</option>
                        <option value="CONCLUIDO">Concluído</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
