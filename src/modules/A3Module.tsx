import { type A3Data, type A3PlanoAcao, type A3Indicador } from "@/store/useAppStore";
import { InputField } from "@/components/InputField";
import { Download, LayoutTemplate, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import ExcelJS from "exceljs";

const TextAreaBlock = ({ title, value, onChangeField }: { title: string, value: string, onChangeField: (v: string) => void }) => (
  <div className="flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm shrink-0 min-h-[140px] flex-1">
    <div className="bg-blue-600 border-b border-blue-700 px-3 py-1.5">
      <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">{title}</h4>
    </div>
    <textarea
      className="flex-1 w-full p-3 text-xs text-slate-600 outline-none resize-none bg-transparent leading-relaxed"
      placeholder="Descreva..."
      value={value || ""}
      onChange={(e) => onChangeField(e.target.value)}
    />
  </div>
);

const formatBRDate = (dateStr: string) => {
  if (!dateStr) return "";
  const parts = dateStr.split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return dateStr;
};

interface Props {
  data: A3Data;
  onChange: (d: Partial<A3Data>) => void;
}

export function A3Module({ data, onChange }: Props) {

  const listaPlanoAcao = Array.isArray(data.planoAcao) ? data.planoAcao : [];
  const listaIndicadores = Array.isArray(data.indicadores) ? data.indicadores : [];

  const handleExportExcel = async () => {
    try {
      const response = await fetch('/template_a3.xlsx');
      const contentType = response.headers.get("content-type");
      
      if (!response.ok || (contentType && contentType.includes("text/html"))) {
        toast.error("O molde não foi encontrado! Verifique se o nome está exatamente como 'template_a3.xlsx' na pasta public.");
        return;
      }

      const arrayBuffer = await response.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(arrayBuffer);
      const ws = workbook.worksheets[0];

      if (data.titulo) ws.getCell('I2').value = data.titulo;       
      if (data.data) ws.getCell('BD2').value = formatBRDate(data.data);          
      if (data.aprovacoes) ws.getCell('CB2').value = data.aprovacoes; 

      if (data.background) ws.getCell('A5').value = data.background;
      if (data.objetivos) ws.getCell('A16').value = data.objetivos;
      if (data.estadoAtual) ws.getCell('A24').value = data.estadoAtual;
      if (data.analise) ws.getCell('A37').value = data.analise;

      if (data.estadoFuturo) ws.getCell('AO5').value = data.estadoFuturo;
      
      let rowAcao = 18; 
      listaPlanoAcao.forEach(acao => {
        ws.getCell(`AO${rowAcao}`).value = acao.oque;
        ws.getCell(`BD${rowAcao}`).value = acao.quem;
        ws.getCell(`BK${rowAcao}`).value = acao.prazo;
        rowAcao++;
      });

      let rowInd = 33;
      listaIndicadores.forEach(ind => {
        ws.getCell(`AO${rowInd}`).value = ind.indicador;
        ws.getCell(`BD${rowInd}`).value = ind.meta;   
        ws.getCell(`BK${rowInd}`).value = ind.status; 
        rowInd++;
      });

      if (data.observacoes) ws.getCell('A47').value = data.observacoes; 

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `A3_${data.titulo || 'Toyota'}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success("Excel gerado a partir do seu template original!");

    } catch (error) {
      console.error(error);
      toast.error("Falha técnica ao tentar montar o Excel.");
    }
  };

  const generateId = () => Date.now().toString() + Math.random().toString(36).substring(2, 9);

  const addPlanoAcao = () => {
    onChange({ planoAcao: [...listaPlanoAcao, { id: generateId(), oque: "", quem: "", prazo: "" }] });
  };
  const removePlanoAcao = (id: string) => {
    onChange({ planoAcao: listaPlanoAcao.filter(a => a.id !== id) });
  };
  const updatePlanoAcao = (id: string, field: keyof A3PlanoAcao, value: string) => {
    onChange({ planoAcao: listaPlanoAcao.map(a => a.id === id ? { ...a, [field]: value } : a) });
  };

  const addIndicador = () => {
    onChange({ indicadores: [...listaIndicadores, { id: generateId(), indicador: "", meta: "", status: "" }] });
  };
  const removeIndicador = (id: string) => {
    onChange({ indicadores: listaIndicadores.filter(i => i.id !== id) });
  };
  const updateIndicador = (id: string, field: keyof A3Indicador, value: string) => {
    onChange({ indicadores: listaIndicadores.map(i => i.id === id ? { ...i, [field]: value } : i) });
  };

  return (
    <div className="flex flex-col gap-4 h-full pb-36 animate-in fade-in duration-500 overflow-y-auto pr-2">
      
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <LayoutTemplate className="h-6 w-6 text-blue-600" /> RELATÓRIO A3 (TOYOTA)
          </h2>
          <p className="text-sm text-slate-500 mt-1">Preencha o formulário espelhado para exportação 100% exata.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-bold text-xs uppercase tracking-widest shadow-md hover:bg-emerald-700 transition-all"
          >
            <Download className="h-4 w-4" /> Baixar Excel
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-inner">
        
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm shrink-0">
          <div className="md:col-span-3"><InputField label="Título / Tema" value={data.titulo || ""} onChange={v => onChange({ titulo: v })} /></div>
          <InputField label="Data" value={data.data || ""} onChange={v => onChange({ data: v })} type="date" />
          <div className="md:col-span-2"><InputField label="Aprovações" value={data.aprovacoes || ""} onChange={v => onChange({ aprovacoes: v })} /></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          
          <div className="flex flex-col gap-4">
            <TextAreaBlock title="1. Considerações Iniciais (Background)" value={data.background} onChangeField={v => onChange({ background: v })} />
            <TextAreaBlock title="2. Metas, Objetivos, Benefícios" value={data.objetivos} onChangeField={v => onChange({ objetivos: v })} />
            <TextAreaBlock title="3. Estado Atual" value={data.estadoAtual} onChangeField={v => onChange({ estadoAtual: v })} />
            <TextAreaBlock title="4. Análise" value={data.analise} onChangeField={v => onChange({ analise: v })} />
          </div>

          <div className="flex flex-col gap-4">
            <TextAreaBlock title="5. Estado Futuro / Recomendações" value={data.estadoFuturo} onChangeField={v => onChange({ estadoFuturo: v })} />
            
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col shrink-0">
              <div className="bg-blue-600 border-b border-blue-700 px-3 py-1.5 flex justify-between items-center">
                <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">6. Plano de Ação</h4>
                <button onClick={addPlanoAcao} className="text-white bg-white/20 hover:bg-white/30 rounded p-1 transition-colors"><Plus className="w-3 h-3" /></button>
              </div>
              <div className="p-3 flex flex-col gap-2 bg-slate-50/50">
                <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-slate-500 uppercase px-1">
                  <div className="col-span-6">Ação / O quê?</div><div className="col-span-3">Responsável</div><div className="col-span-2">Prazo</div>
                </div>
                {listaPlanoAcao.map((a, index) => (
                  <div key={a.id || index} className="grid grid-cols-12 gap-2 items-center shrink-0">
                    <div className="col-span-6"><input type="text" className="w-full text-xs p-2 rounded-md border border-slate-200 outline-none focus:border-blue-400 transition-colors" value={a.oque || ""} onChange={e => updatePlanoAcao(a.id, "oque", e.target.value)} /></div>
                    <div className="col-span-3"><input type="text" className="w-full text-xs p-2 rounded-md border border-slate-200 outline-none focus:border-blue-400 transition-colors" value={a.quem || ""} onChange={e => updatePlanoAcao(a.id, "quem", e.target.value)} /></div>
                    <div className="col-span-2"><input type="text" className="w-full text-xs p-2 rounded-md border border-slate-200 outline-none focus:border-blue-400 transition-colors" value={a.prazo || ""} onChange={e => updatePlanoAcao(a.id, "prazo", e.target.value)} /></div>
                    <div className="col-span-1 text-center"><button onClick={() => removePlanoAcao(a.id)} className="text-rose-500 hover:bg-rose-100 p-1.5 rounded transition-colors"><Trash2 className="w-3.5 h-3.5" /></button></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col shrink-0">
              <div className="bg-blue-600 border-b border-blue-700 px-3 py-1.5 flex justify-between items-center">
                <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">7. Acompanhamento / Indicadores</h4>
                <button onClick={addIndicador} className="text-white bg-white/20 hover:bg-white/30 rounded p-1 transition-colors"><Plus className="w-3 h-3" /></button>
              </div>
              <div className="p-3 flex flex-col gap-2 bg-slate-50/50">
                <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-slate-500 uppercase px-1">
                  <div className="col-span-5">Indicador</div><div className="col-span-3">Meta</div><div className="col-span-3">Status</div>
                </div>
                {listaIndicadores.map((i, index) => (
                  <div key={i.id || index} className="grid grid-cols-12 gap-2 items-center shrink-0">
                    <div className="col-span-5"><input type="text" className="w-full text-xs p-2 rounded-md border border-slate-200 outline-none focus:border-blue-400 transition-colors" value={i.indicador || ""} onChange={e => updateIndicador(i.id, "indicador", e.target.value)} /></div>
                    <div className="col-span-3"><input type="text" className="w-full text-xs p-2 rounded-md border border-slate-200 outline-none focus:border-blue-400 transition-colors" value={i.meta || ""} onChange={e => updateIndicador(i.id, "meta", e.target.value)} /></div>
                    <div className="col-span-3">
                      <select className="w-full text-xs p-2 rounded-md border border-slate-200 outline-none focus:border-blue-400 bg-white transition-colors" value={i.status || ""} onChange={e => updateIndicador(i.id, "status", e.target.value)}>
                        <option value="">Selecione</option><option value="No Prazo">No Prazo</option><option value="Atrasado">Atrasado</option><option value="Concluído">Concluído</option>
                      </select>
                    </div>
                    <div className="col-span-1 text-center"><button onClick={() => removeIndicador(i.id)} className="text-rose-500 hover:bg-rose-100 p-1.5 rounded transition-colors"><Trash2 className="w-3.5 h-3.5" /></button></div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
        
        <div className="mt-2 shrink-0">
           <TextAreaBlock title="Descrição / Observações Adicionais" value={data.observacoes || ""} onChangeField={v => onChange({ observacoes: v })} />
        </div>

      </div>
    </div>
  );
}
