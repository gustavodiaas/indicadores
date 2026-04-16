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
      const workbook = new ExcelJS.Workbook();
      const ws = workbook.addWorksheet("Relatório A3");

      // 1. Configuração de Colunas (8 colunas para dar flexibilidade de layout)
      ws.columns = [
        { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 },
        { width: 5 },  // Espaçador central
        { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }
      ];

      // Estilos de formatação
      const headerStyle: Partial<ExcelJS.Style> = {
        font: { bold: true, color: { argb: 'FFFFFF' }, size: 10 },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '333333' } },
        alignment: { vertical: 'middle', horizontal: 'left' },
        border: { bottom: { style: 'thin' }, top: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
      };

      const contentStyle: Partial<ExcelJS.Style> = {
        alignment: { vertical: 'top', horizontal: 'left', wrapText: true },
        border: { bottom: { style: 'thin' }, top: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
      };

      // 2. Título do Relatório
      ws.mergeCells('A1:I1');
      const titleCell = ws.getCell('A1');
      titleCell.value = `TÍTULO / TEMA: ${data.titulo || 'Sem Título'}`;
      titleCell.font = { bold: true, size: 14 };
      titleCell.alignment = { horizontal: 'center' };

      // 3. Cabeçalho de Informações
      ws.getCell('A2').value = "Responsável:"; ws.getCell('B2').value = data.responsavel;
      ws.getCell('D2').value = "Data:"; ws.getCell('E2').value = data.data;
      ws.getCell('G2').value = "Início:"; ws.getCell('H2').value = data.inicio;
      ws.getCell('I2').value = "Fim:"; ws.getCell('I2').value = data.fim;
      
      ws.mergeCells('A3:I3');
      ws.getCell('A3').value = `Aprovações: ${data.aprovacoes || ''}`;

      // 4. LADO ESQUERDO (Blocos 1 a 4)
      const renderBlock = (rowStart: number, rowEnd: number, colStart: string, colEnd: string, title: string, value: string) => {
        const range = `${colStart}${rowStart}:${colEnd}${rowStart}`;
        ws.mergeCells(range);
        const hCell = ws.getCell(`${colStart}${rowStart}`);
        hCell.value = title;
        hCell.style = headerStyle;

        const contentRange = `${colStart}${rowStart + 1}:${colEnd}${rowEnd}`;
        ws.mergeCells(contentRange);
        const cCell = ws.getCell(`${colStart}${rowStart + 1}`);
        cCell.value = value;
        cCell.style = contentStyle;
      };

      // Esquerda
      renderBlock(5, 9, 'A', 'D', "1. CONSIDERAÇÕES INICIAIS (BACKGROUND)", data.background);
      renderBlock(11, 15, 'A', 'D', "2. METAS, OBJETIVOS E BENEFÍCIOS", data.objetivos);
      renderBlock(17, 21, 'A', 'D', "3. ESTADO ATUAL", data.estadoAtual);
      renderBlock(23, 27, 'A', 'D', "4. ANÁLISE", data.analise);

      // Direita (Coluna F em diante)
      renderBlock(5, 9, 'F', 'I', "5. ESTADO FUTURO / RECOMENDAÇÕES", data.estadoFuturo);
      renderBlock(11, 19, 'F', 'I', "6. PLANO DE AÇÃO (O QUÊ? QUEM? QUANDO?)", data.planoAcao);
      renderBlock(21, 27, 'F', 'I', "7. ACOMPANHAMENTO / INDICADORES", data.indicadores);

      // 5. Finalização e Download
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `A3_${data.titulo || 'Relatorio'}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      toast.success("Excel gerado com sucesso!");

    } catch (error) {
      console.error(error);
      toast.error("Erro ao gerar o Excel.");
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

          <div className="print-grid grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-4">
              <TextAreaBlock title="1. Considerações Iniciais (Background)" value={data.background} onChangeField={v => onChange({ background: v })} />
              <TextAreaBlock title="2. Metas, Objetivos e Benefícios" value={data.objetivos} onChangeField={v => onChange({ objetivos: v })} />
              <TextAreaBlock title="3. Estado Atual (Mapeamento / Fatos)" value={data.estadoAtual} onChangeField={v => onChange({ estadoAtual: v })} />
              <TextAreaBlock title="4. Análise de Causa Raiz" value={data.analise} onChangeField={v => onChange({ analise: v })} />
            </div>

            <div className="flex flex-col gap-4">
              <TextAreaBlock title="5. Estado Futuro / Recomendações" value={data.estadoFuturo} onChangeField={v => onChange({ estadoFuturo: v })} />
              <TextAreaBlock title="6. Plano de Ação (O quê? Quem? Quando?)" value={data.planoAcao} onChangeField={v => onChange({ planoAcao: v })} />
              <TextAreaBlock title="7. Acompanhamento / Indicadores" value={data.indicadores} onChangeField={v => onChange({ indicadores: v })} />
              
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
