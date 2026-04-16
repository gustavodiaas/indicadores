import { type A3Data } from "@/store/useAppStore";
import { InputField } from "@/components/InputField";
import { Download, Printer, LayoutTemplate } from "lucide-react";
import { toast } from "sonner";
import ExcelJS from "exceljs";

interface Props {
  data: A3Data;
  onChange: (d: Partial<A3Data>) => void;
}

export function A3Module({ data, onChange }: Props) {
  
  const handlePrintPDF = () => {
    window.print();
  };

  const handleExportExcel = async () => {
    try {
      const response = await fetch('/template_a3.xlsx');
      
      if (!response.ok) {
        const workbook = new ExcelJS.Workbook();
        const ws = workbook.addWorksheet("Relatório A3");
        ws.getColumn(1).width = 40; ws.getColumn(2).width = 40;

        ws.addRow(["TÍTULO / TEMA:", data.titulo]);
        ws.addRow(["Responsável:", data.responsavel, "Data:", data.data]);
        ws.addRow(["Início:", data.inicio, "Fim:", data.fim]);
        ws.addRow(["Aprovações:", data.aprovacoes]);
        ws.addRow([]);
        ws.addRow(["1. CONSIDERAÇÕES INICIAIS (BACKGROUND)", "5. ESTADO FUTURO / RECOMENDAÇÕES"]);
        ws.addRow([data.background, data.estadoFuturo]);
        ws.addRow([]);
        ws.addRow(["2. METAS, OBJETIVOS, BENEFÍCIOS", "6. PLANO DE AÇÃO (O QUÊ? QUEM? QUANDO?)"]);
        ws.addRow([data.objetivos, data.planoAcao]);
        ws.addRow([]);
        ws.addRow(["3. ESTADO ATUAL", "7. ACOMPANHAMENTO / INDICADORES"]);
        ws.addRow([data.estadoAtual, data.indicadores]);
        ws.addRow([]);
        ws.addRow(["4. ANÁLISE", ""]);
        ws.addRow([data.analise, ""]);

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Relatorio_A3_Lean.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
        toast.success("Excel gerado com sucesso!");
        return;
      }

      // Se existir o template_a3.xlsx na pasta public, ele preenche
      const arrayBuffer = await response.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(arrayBuffer);
      const ws = workbook.worksheets[0];

      ws.getCell('B2').value = data.titulo;
      ws.getCell('B3').value = data.responsavel;
      ws.getCell('D3').value = data.data;
      ws.getCell('F3').value = data.inicio;
      ws.getCell('H3').value = data.fim;
      ws.getCell('B4').value = data.aprovacoes;

      ws.getCell('A6').value = data.background;
      ws.getCell('A12').value = data.objetivos;
      ws.getCell('A18').value = data.estadoAtual;
      ws.getCell('A24').value = data.analise;

      ws.getCell('G6').value = data.estadoFuturo;
      ws.getCell('G12').value = data.planoAcao;
      ws.getCell('G18').value = data.indicadores;

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `A3_${data.titulo || 'Lean'}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success("Excel exportado usando seu template!");

    } catch (error) {
      console.error(error);
      toast.error("Erro ao gerar a planilha.");
    }
  };

  const TextAreaBlock = ({ title, value, onChangeField }: { title: string, value: string, onChangeField: (v: string) => void }) => (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="bg-slate-800 border-b border-slate-700 px-3 py-1.5">
        <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">{title}</h4>
      </div>
      <textarea
        className="flex-1 w-full p-4 text-[13px] text-slate-600 outline-none resize-none bg-transparent min-h-[140px] leading-relaxed"
        placeholder="Digite aqui..."
        value={value}
        onChange={(e) => onChangeField(e.target.value)}
      />
    </div>
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: A3 landscape; margin: 8mm; }
          body { background: white !important; -webkit-print-color-adjust: exact; }
          .print-hide { display: none !important; }
          .print-panel { border: 2px solid #000 !important; background: white !important; border-radius: 0 !important; padding: 0 !important; }
          .print-grid { gap: 2mm !important; }
          textarea { border: none !important; padding: 2mm !important; }
          .bg-slate-800 { background-color: #333 !important; }
        }
      `}} />

      <div className="flex flex-col gap-4 h-full pb-36 animate-in fade-in duration-500 overflow-y-auto print:overflow-visible print:pb-0">
        
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 print-hide">
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <LayoutTemplate className="h-6 w-6 text-indigo-600" /> PENSAMENTO A3 (LEAN INSTITUTE)
            </h2>
            <p className="text-sm text-slate-500 mt-1">Metodologia estruturada para solução de problemas e melhoria.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handlePrintPDF}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 text-white rounded-lg font-bold text-xs uppercase tracking-widest shadow-md hover:bg-slate-900 transition-all"
            >
              <Printer className="h-4 w-4" /> PDF / Imprimir
            </button>
            <button 
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-bold text-xs uppercase tracking-widest shadow-md hover:bg-emerald-700 transition-all"
            >
              <Download className="h-4 w-4" /> Excel
            </button>
          </div>
        </div>

        <div className="print-panel flex flex-col gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-inner">
          
          {/* Cabeçalho do A3 */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="md:col-span-2">
              <InputField label="Título / Tema" value={data.titulo} onChange={v => onChange({ titulo: v })} />
            </div>
            <InputField label="Responsável" value={data.responsavel} onChange={v => onChange({ responsavel: v })} />
            <InputField label="Data" value={data.data} onChange={v => onChange({ data: v })} type="date" />
            <InputField label="Início" value={data.inicio} onChange={v => onChange({ inicio: v })} type="date" />
            <InputField label="Fim" value={data.fim} onChange={v => onChange({ fim: v })} type="date" />
            <div className="md:col-span-6">
               <InputField label="Aprovações" value={data.aprovacoes} onChange={v => onChange({ aprovacoes: v })} />
            </div>
          </div>

          {/* Corpo do A3 - Divisão Lean */}
          <div className="print-grid grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Lado Esquerdo: Identificação e Análise */}
            <div className="flex flex-col gap-4">
              <TextAreaBlock title="1. Considerações Iniciais (Background)" value={data.background} onChangeField={v => onChange({ background: v })} />
              <TextAreaBlock title="2. Metas, Objetivos e Benefícios" value={data.objetivos} onChangeField={v => onChange({ objetivos: v })} />
              <TextAreaBlock title="3. Estado Atual (Mapeamento / Fatos)" value={data.estadoAtual} onChangeField={v => onChange({ estadoAtual: v })} />
              <TextAreaBlock title="4. Análise de Causa Raiz" value={data.analise} onChangeField={v => onChange({ analise: v })} />
            </div>

            {/* Lado Direito: Ação e Evolução */}
            <div className="flex flex-col gap-4">
              <TextAreaBlock title="5. Estado Futuro / Recomendações" value={data.estadoFuturo} onChangeField={v => onChange({ estadoFuturo: v })} />
              <TextAreaBlock title="6. Plano de Ação (O quê? Quem? Quando?)" value={data.planoAcao} onChangeField={v => onChange({ planoAcao: v })} />
              <TextAreaBlock title="7. Acompanhamento / Indicadores" value={data.indicadores} onChangeField={v => onChange({ indicadores: v })} />
              
              {/* Espaço extra para manter simetria visual */}
              <div className="hidden md:flex flex-1 items-center justify-center p-8 opacity-10 grayscale pointer-events-none select-none">
                 <LayoutTemplate className="w-32 h-32 text-slate-400" />
              </div>
            </div>

          </div>
        </div>

      </div>
    </>
  );
}
