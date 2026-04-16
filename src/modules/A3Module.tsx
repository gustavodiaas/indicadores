import { type A3Data, type A3PlanoAcao, type A3Indicador } from "@/store/useAppStore";
import { InputField } from "@/components/InputField";
import { Download, Printer, LayoutTemplate, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import ExcelJS from "exceljs";

interface Props {
  data: A3Data;
  onChange: (d: Partial<A3Data>) => void;
}

export function A3Module({ data, onChange }: Props) {

  const handleExportExcel = async () => {
    try {
      const response = await fetch('/template_a3.xlsx');
      
      if (!response.ok) {
        toast.error("Arquivo não encontrado! Coloque o 'template_a3.xlsx' na pasta public.");
        return;
      }

      const arrayBuffer = await response.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(arrayBuffer);
      const ws = workbook.worksheets[0];

      // --- INJEÇÃO DE DADOS (Células Baseadas no seu Layout) ---
      
      // Cabeçalho
      ws.getCell('B2').value = data.titulo;       
      ws.getCell('P2').value = data.data;          
      ws.getCell('Z2').value = data.aprovacoes; 

      // Lado Esquerdo
      ws.getCell('A4').value = data.background;
      ws.getCell('A12').value = data.objetivos;
      ws.getCell('A20').value = data.estadoAtual;
      ws.getCell('A28').value = data.analise;

      // Lado Direito - Estado Futuro
      ws.getCell('T4').value = data.estadoFuturo; // Coluna de divisão (Ajustar a Letra 'T' conforme seu arquivo real)
      
      // Lado Direito - Plano de Ação (A partir da linha 14, por exemplo)
      let rowAcao = 14; 
      data.planoAcao.forEach(acao => {
        ws.getCell(`T${rowAcao}`).value = acao.oque;
        ws.getCell(`AE${rowAcao}`).value = acao.quem; // Ajustar letra
        ws.getCell(`AK${rowAcao}`).value = acao.prazo; // Ajustar letra
        rowAcao++;
      });

      // Lado Direito - Acompanhamento (A partir da linha 24, por exemplo)
      let rowInd = 24;
      data.indicadores.forEach(ind => {
        ws.getCell(`T${rowInd}`).value = ind.indicador;
        ws.getCell(`AE${rowInd}`).value = ind.meta;   // Ajustar letra
        ws.getCell(`AK${rowInd}`).value = ind.status; // Ajustar letra
        rowInd++;
      });

      // Rodapé
      ws.getCell('A36').value = data.observacoes; // Ajustar linha

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
      toast.error("Erro ao gerar a planilha. Verifique o console.");
    }
  };

  const handlePrintPDF = () => {
    toast.info("Para garantir a formatação exata do seu A3, o sistema fará o download do arquivo original. Imprima diretamente pelo Excel.");
    handleExportExcel();
  };

  const addPlanoAcao = () => {
    onChange({ planoAcao: [...data.planoAcao, { id: Date.now().toString(), oque: "", quem: "", prazo: "" }] });
  };
  const removePlanoAcao = (id: string) => {
    onChange({ planoAcao: data.planoAcao.filter(a => a.id !== id) });
  };
  const updatePlanoAcao = (id: string, field: keyof A3PlanoAcao, value: string) => {
    onChange({ planoAcao: data.planoAcao.map(a => a.id === id ? { ...a, [field]: value } : a) });
  };

  const addIndicador = () => {
    onChange({ indicadores: [...data.indicadores, { id: Date.now().toString(), indicador: "", meta: "", status: "" }] });
  };
  const removeIndicador = (id: string) => {
    onChange({ indicadores: data.indicadores.filter(i => i.id !== id) });
  };
  const updateIndicador = (id: string, field: keyof A3Indicador, value: string) => {
    onChange({ indicadores: data.indicadores.map(i => i.id === id ? { ...i, [field]: value } : i) });
  };

  const TextAreaBlock = ({ title, value, onChangeField }: { title: string, value: string, onChangeField: (v: string) => void }) => (
    <div className="flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm h-full min-h-[140px]">
      <div className="bg-slate-800 border-b border-slate-700 px-3 py-1.5">
        <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">{title}</h4>
      </div>
      <textarea
        className="flex-1 w-full p-3 text-xs text-slate-600 outline-none resize-none bg-transparent leading-relaxed"
        placeholder="Descreva..."
        value={value}
        onChange={(e) => onChangeField(e.target.value)}
      />
    </div>
  );

  return (
    <div className="flex flex-col gap-4 h-full pb-36 animate-in fade-in duration-500 overflow-y-auto pr-2">
      
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <LayoutTemplate className="h-6 w-6 text-indigo-600" /> RELATÓRIO A3 (TOYOTA)
          </h2>
          <p className="text-sm text-slate-500 mt-1">Preencha o formulário espelhado para exportação 100% exata.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handlePrintPDF}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 text-white rounded-lg font-bold text-xs uppercase tracking-widest shadow-md hover:bg-slate-900 transition-all"
          >
            <Printer className="h-4 w-4" /> Imprimir Original
          </button>
          <button 
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-bold text-xs uppercase tracking-widest shadow-md hover:bg-emerald-700 transition-all"
          >
            <Download className="h-4 w-4" /> Baixar Excel
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-inner">
        
        {/* CABEÇALHO */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="md:col-span-3"><InputField label="Título / Tema" value={data.titulo} onChange={v => onChange({ titulo: v })} /></div>
          <InputField label="Data" value={data.data} onChange={v => onChange({ data: v })} type="date" />
          <div className="md:col-span-2"><InputField label="Aprovações" value={data.aprovacoes} onChange={v => onChange({ aprovacoes: v })} /></div>
        </div>

        {/* CORPO DIVIDIDO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* LADO ESQUERDO */}
          <div className="flex flex-col gap-4">
            <TextAreaBlock title="1. Considerações Iniciais (Background)" value={data.background} onChangeField={v => onChange({ background: v })} />
            <TextAreaBlock title="2. Metas, Objetivos, Benefícios" value={data.objetivos} onChangeField={v => onChange({ objetivos: v })} />
            <TextAreaBlock title="3. Estado Atual" value={data.estadoAtual} onChangeField={v => onChange({ estadoAtual: v })} />
            <TextAreaBlock title="4. Análise" value={data.analise} onChangeField={v => onChange({ analise: v })} />
          </div>

          {/* LADO DIREITO */}
          <div className="flex flex-col gap-4">
            <TextAreaBlock title="5. Estado Futuro / Recomendações" value={data.estadoFuturo} onChangeField={v => onChange({ estadoFuturo: v })} />
            
            {/* 6. PLANO DE AÇÃO (TABELA) */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="bg-slate-800 border-b border-slate-700 px-3 py-1.5 flex justify-between items-center">
                <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">6. Plano de Ação</h4>
                <button onClick={addPlanoAcao} className="text-white bg-white/20 hover:bg-white/30 rounded p-1"><Plus className="w-3 h-3" /></button>
              </div>
              <div className="p-3 flex flex-col gap-2 bg-slate-50/50">
                <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-slate-500 uppercase px-1">
                  <div className="col-span-6">Ação / O quê?</div><div className="col-span-3">Responsável</div><div className="col-span-2">Prazo</div>
                </div>
                {data.planoAcao.map((a) => (
                  <div key={a.id} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-6"><input type="text" className="w-full text-xs p-2 rounded-md border border-slate-200 outline-none" value={a.oque} onChange={e => updatePlanoAcao(a.id, "oque", e.target.value)} /></div>
                    <div className="col-span-3"><input type="text" className="w-full text-xs p-2 rounded-md border border-slate-200 outline-none" value={a.quem} onChange={e => updatePlanoAcao(a.id, "quem", e.target.value)} /></div>
                    <div className="col-span-2"><input type="text" className="w-full text-xs p-2 rounded-md border border-slate-200 outline-none" value={a.prazo} onChange={e => updatePlanoAcao(a.id, "prazo", e.target.value)} /></div>
                    <div className="col-span-1 text-center"><button onClick={() => removePlanoAcao(a.id)} className="text-rose-500 hover:bg-rose-100 p-1.5 rounded"><Trash2 className="w-3.5 h-3.5" /></button></div>
                  </div>
                ))}
              </div>
            </div>

            {/* 7. ACOMPANHAMENTO (TABELA) */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="bg-slate-800 border-b border-slate-700 px-3 py-1.5 flex justify-between items-center">
                <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">7. Acompanhamento / Indicadores</h4>
                <button onClick={addIndicador} className="text-white bg-white/20 hover:bg-white/30 rounded p-1"><Plus className="w-3 h-3" /></button>
              </div>
              <div className="p-3 flex flex-col gap-2 bg-slate-50/50">
                <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-slate-500 uppercase px-1">
                  <div className="col-span-5">Indicador</div><div className="col-span-3">Meta</div><div className="col-span-3">Status</div>
                </div>
                {data.indicadores.map((i) => (
                  <div key={i.id} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-5"><input type="text" className="w-full text-xs p-2 rounded-md border border-slate-200 outline-none" value={i.indicador} onChange={e => updateIndicador(i.id, "indicador", e.target.value)} /></div>
                    <div className="col-span-3"><input type="text" className="w-full text-xs p-2 rounded-md border border-slate-200 outline-none" value={i.meta} onChange={e => updateIndicador(i.id, "meta", e.target.value)} /></div>
                    <div className="col-span-3">
                      <select className="w-full text-xs p-2 rounded-md border border-slate-200 outline-none bg-white" value={i.status} onChange={e => updateIndicador(i.id, "status", e.target.value)}>
                        <option value="">Selecione</option><option value="No Prazo">No Prazo</option><option value="Atrasado">Atrasado</option><option value="Concluído">Concluído</option>
                      </select>
                    </div>
                    <div className="col-span-1 text-center"><button onClick={() => removeIndicador(i.id)} className="text-rose-500 hover:bg-rose-100 p-1.5 rounded"><Trash2 className="w-3.5 h-3.5" /></button></div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
        
        {/* OBSERVAÇÕES FINAIS (COMO NO SEU EXCEL) */}
        <div className="mt-2">
           <TextAreaBlock title="Descrição / Observações Adicionais" value={data.observacoes} onChangeField={v => onChange({ observacoes: v })} />
        </div>

      </div>
    </div>
  );
}
