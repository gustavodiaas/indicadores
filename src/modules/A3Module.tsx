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
        // Fallback básico se não houver molde
        const workbook = new ExcelJS.Workbook();
        const ws = workbook.addWorksheet("Relatório A3");
        
        ws.getColumn(1).width = 50;
        ws.getColumn(2).width = 50;

        ws.addRow(["TEMA / PROBLEMA:", data.tema]);
        ws.addRow(["Responsável:", data.responsavel, "Data:", data.data]);
        ws.addRow([]);
        ws.addRow(["1. CONTEXTO", "5. CONTRAMEDIDAS"]);
        ws.addRow([data.contexto, data.contramedidas]);
        ws.addRow([]);
        ws.addRow(["2. CONDIÇÃO ATUAL", "6. PLANO DE AÇÃO"]);
        ws.addRow([data.condicaoAtual, data.planoAcao]);
        ws.addRow([]);
        ws.addRow(["3. METAS / OBJETIVOS", "7. ACOMPANHAMENTO DOS RESULTADOS"]);
        ws.addRow([data.metas, data.acompanhamento]);
        ws.addRow([]);
        ws.addRow(["4. ANÁLISE DE CAUSA RAIZ", ""]);
        ws.addRow([data.analiseCausa, ""]);

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Relatorio_A3_Basico.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
        toast.success("Excel básico gerado. Suba um 'template_a3.xlsx' para formato personalizado.");
        return;
      }

      // Se houver molde, injeta
      const arrayBuffer = await response.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(arrayBuffer);
      const ws = workbook.worksheets[0];

      // Ajuste as células abaixo conforme o seu futuro template_a3.xlsx
      ws.getCell('B2').value = data.tema;
      ws.getCell('B3').value = data.responsavel;
      ws.getCell('G3').value = data.data;

      ws.getCell('A6').value = data.contexto;
      ws.getCell('A12').value = data.condicaoAtual;
      ws.getCell('A18').value = data.metas;
      ws.getCell('A24').value = data.analiseCausa;

      ws.getCell('G6').value = data.contramedidas;
      ws.getCell('G12').value = data.planoAcao;
      ws.getCell('G18').value = data.acompanhamento;

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Relatorio_A3.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success("Excel gerado a partir do seu template!");

    } catch (error) {
      console.error(error);
      toast.error("Erro ao gerar a planilha.");
    }
  };

  const TextAreaBlock = ({ title, value, onChangeField }: { title: string, value: string, onChangeField: (v: string) => void }) => (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="bg-slate-100 border-b border-slate-200 px-3 py-2">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">{title}</h4>
      </div>
      <textarea
        className="flex-1 w-full p-3 text-sm text-slate-600 outline-none resize-none bg-transparent min-h-[120px]"
        placeholder="Descreva aqui..."
        value={value}
        onChange={(e) => onChangeField(e.target.value)}
      />
    </div>
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: A3 landscape; margin: 10mm; }
          body { background: white !important; -webkit-print-color-adjust: exact; }
          .print-hide { display: none !important; }
          .print-panel { border: none !important; shadow: none !important; }
          .print-grid { gap: 4mm !important; }
          textarea { border: none !important; resize: none !important; height: auto !important; overflow: hidden !important; }
        }
      `}} />

      <div className="flex flex-col gap-4 h-full pb-36 animate-in fade-in duration-500 overflow-y-auto print:overflow-visible print:pb-0">
        
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 print-hide">
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <LayoutTemplate className="h-6 w-6 text-indigo-500" /> MODELO A3 (SOLUÇÃO DE PROBLEMAS)
            </h2>
            <p className="text-sm text-slate-500 mt-1">Visão estruturada para análise de causa raiz e plano de ação.</p>
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

        <div className="print-panel flex flex-col gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          
          {/* Cabeçalho do A3 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="md:col-span-2">
              <InputField label="Tema / Problema" value={data.tema} onChange={v => onChange({ tema: v })} />
            </div>
            <InputField label="Responsável" value={data.responsavel} onChange={v => onChange({ responsavel: v })} />
            <InputField label="Data" value={data.data} onChange={v => onChange({ data: v })} type="date" />
          </div>

          {/* Corpo do A3 - Duas Colunas */}
          <div className="print-grid grid grid-cols-1 md:grid-cols-2 gap-6 h-full min-h-[600px]">
            
            {/* Lado Esquerdo: O Problema */}
            <div className="flex flex-col gap-4">
              <TextAreaBlock title="1. Contexto / Histórico" value={data.contexto} onChangeField={v => onChange({ contexto: v })} />
              <TextAreaBlock title="2. Condição Atual" value={data.condicaoAtual} onChangeField={v => onChange({ condicaoAtual: v })} />
              <TextAreaBlock title="3. Objetivos e Metas" value={data.metas} onChangeField={v => onChange({ metas: v })} />
              <TextAreaBlock title="4. Análise de Causa Raiz" value={data.analiseCausa} onChangeField={v => onChange({ analiseCausa: v })} />
            </div>

            {/* Lado Direito: A Solução */}
            <div className="flex flex-col gap-4">
              <TextAreaBlock title="5. Contramedidas" value={data.contramedidas} onChangeField={v => onChange({ contramedidas: v })} />
              <TextAreaBlock title="6. Plano de Ação (Resumo)" value={data.planoAcao} onChangeField={v => onChange({ planoAcao: v })} />
              <TextAreaBlock title="7. Acompanhamento dos Resultados" value={data.acompanhamento} onChangeField={v => onChange({ acompanhamento: v })} />
            </div>

          </div>
        </div>

      </div>
    </>
  );
}
