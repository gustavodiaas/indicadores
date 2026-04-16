import { type PlanoAcaoData, type PlanoAcaoItem } from "@/store/useAppStore";
import { InputField } from "@/components/InputField";
import { Trash2, Download, CheckCircle, ChevronDown, ChevronUp, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import ExcelJS from "exceljs";

interface Props {
  data: PlanoAcaoData;
  onChange: (d: Partial<PlanoAcaoData>) => void;
}

export function PlanoAcaoModule({ data, onChange }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newAcaoWhat, setNewAcaoWhat] = useState("");

  const updateMeta = (field: keyof typeof data.metadata, value: string) => {
    onChange({ metadata: { ...data.metadata, [field]: value } });
  };

  const handleAddAcao = () => {
    if (newAcaoWhat.trim()) {
      const nova: PlanoAcaoItem = {
        id: Date.now().toString(),
        what: newAcaoWhat.trim(),
        why: "", where: "", start: "", end: "", who: "", how: "", howMuch: "", percent: 0, obs: "", status: "NÃO INICIADO"
      };
      onChange({ acoes: [...data.acoes, nova] });
      setNewAcaoWhat("");
    }
  };

  const updateAcao = (id: string, field: keyof PlanoAcaoItem, value: any) => {
    const novasAcoes = data.acoes.map(a => a.id === id ? { ...a, [field]: value } : a);
    onChange({ acoes: novasAcoes });
  };

  const handleRemoveAcao = (id: string) => {
    onChange({ acoes: data.acoes.filter(a => a.id !== id) });
  };

  const handleExportExcel = async () => {
    if (data.acoes.length === 0) {
      toast.error("Adicione ações antes de exportar.");
      return;
    }

    try {
      const response = await fetch('/template_5w2h.xlsx');
      
      if (!response.ok) {
        toast.error("Arquivo não encontrado! Verifique se 'template_5w2h.xlsx' está na pasta public.");
        return;
      }

      const arrayBuffer = await response.arrayBuffer();
      
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(arrayBuffer);
      
      const ws = workbook.worksheets[0];
      const m = data.metadata;

      if (m.dataCriacao) ws.getCell('B3').value = m.dataCriacao;
      if (m.respCriacao) ws.getCell('D3').value = m.respCriacao;
      if (m.objetivo) ws.getCell('G3').value = m.objetivo;
      if (m.meta) ws.getCell('I3').value = m.meta;

      if (m.dataRevisao) ws.getCell('B4').value = m.dataRevisao;
      if (m.respRevisao) ws.getCell('D4').value = m.respRevisao;
      if (m.indicador) ws.getCell('G4').value = m.indicador;

      let currentRow = 8;
      data.acoes.forEach((a) => {
        ws.getCell(`A${currentRow}`).value = a.what;
        ws.getCell(`B${currentRow}`).value = a.how || "";
        ws.getCell(`C${currentRow}`).value = a.who || "";
        ws.getCell(`D${currentRow}`).value = a.start || "";
        ws.getCell(`E${currentRow}`).value = a.end || "";
        ws.getCell(`F${currentRow}`).value = a.where || "";
        ws.getCell(`G${currentRow}`).value = a.why || "";
        ws.getCell(`H${currentRow}`).value = a.howMuch ? Number(a.howMuch) : 0;
        ws.getCell(`I${currentRow}`).value = a.percent ? (Number(a.percent) / 100) : 0;
        ws.getCell(`K${currentRow}`).value = a.obs || "";
        ws.getCell(`L${currentRow}`).value = a.status || "NÃO INICIADO";
        
        currentRow++;
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Plano_Acao_${m.indicador || 'Exportado'}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);

      toast.success("Excel gerado com sucesso preservando o design!");

    } catch (error) {
      console.error(error);
      toast.error("Erro ao gerar a planilha. Verifique o console.");
    }
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
          <InputField label="Responsável (Consultor/Empresário)" value={data.metadata.respCriacao} onChange={v => updateMeta("respCriacao", v)} />
          <InputField label="Objetivo" value={data.metadata.objetivo} onChange={v => updateMeta("objetivo", v)} />
          <InputField label="Meta" value={data.metadata.meta} onChange={v => updateMeta("meta", v)} />
          
          <InputField label="Data de Revisão" value={data.metadata.dataRevisao} onChange={v => updateMeta("dataRevisao", v)} type="date" />
          <InputField label="Responsável (Revisão)" value={data.metadata.respRevisao} onChange={v => updateMeta("respRevisao", v)} />
          <div className="md:col-span-2"><InputField label="Indicador" value={data.metadata.indicador} onChange={v => updateMeta("indicador", v)} /></div>
        </div>
      </div>

      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm flex-1">
        <div className="flex flex-col gap-4 mb-6">
          <h3 className="font-bold text-slate-800 uppercase text-[11px] tracking-widest flex items-center gap-2">
            Execução de Tarefas 
            <span className="bg-sky-200 text-sky-700 px-2 py-0.5 rounded-full text-[10px]">{data.acoes.length}</span>
          </h3>
          
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <InputField label="Nova Ação (What)" value={newAcaoWhat} onChange={setNewAcaoWhat} />
            </div>
            <button 
              onClick={handleAddAcao} 
              className="h-10 px-6 bg-sky-600 text-white rounded-lg font-bold text-xs uppercase shadow-md hover:bg-sky-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Adicionar
            </button>
          </div>
        </div>

        {data.acoes.length === 0 ? (
           <div className="flex flex-col items-center justify-center p-12 text-slate-400 border-2 border-dashed border-slate-300 rounded-xl bg-white">
             <CheckCircle className="h-12 w-12 mb-4 opacity-50" />
             <p className="text-sm font-bold">Nenhuma ação vinculada.</p>
             <p className="text-xs mt-1">Crie tarefas no campo acima ou importe macros da aba "Resumo".</p>
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
                    <InputField label="Quanto Custa? (How Much)" value={a.howMuch} onChange={v => updateAcao(a.id, "howMuch", v)} type="number" />
                    
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
