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

  const handleExportExcel = async () => {
    try {
      const response = await fetch('/template_a3.xlsx');
      
      if (!response.ok) {
        toast.error("Arquivo não encontrado! Coloque o 'template_a3.xlsx' na pasta public.");
        return;
      }

      // Carrega o seu molde preservando TODAS as cores, fontes e bordas [cite: 1]
      const arrayBuffer = await response.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(arrayBuffer);
      const ws = workbook.worksheets[0];

      /* * INJEÇÃO DE DADOS NAS CÉLULAS DO EXCEL
       * Se o texto cair no lugar errado, abra seu Excel, veja qual é a Letra/Número 
       * correta da célula (ex: B2, AZ5) e altere aqui embaixo.
       */

      // Cabeçalho (Linha 2)
      if (data.titulo) ws.getCell('I2').value = data.titulo;       // Ajuste a letra conforme seu Excel
      if (data.data) ws.getCell('BD2').value = data.data;          // Ajuste a letra
      if (data.aprovacoes) ws.getCell('CB2').value = data.aprovacoes; // Ajuste a letra

      // Lado Esquerdo
      if (data.background) ws.getCell('A4').value = data.background;
      if (data.objetivos) ws.getCell('A16').value = data.objetivos;
      if (data.estadoAtual) ws.getCell('A25').value = data.estadoAtual;
      if (data.analise) ws.getCell('A37').value = data.analise;

      // Lado Direito
      if (data.estadoFuturo) ws.getCell('AO4').value = data.estadoFuturo; // Ajuste para a coluna que divide a folha
      if (data.planoAcao) ws.getCell('AO16').value = data.planoAcao;
      if (data.indicadores) ws.getCell('AO25').value = data.indicadores;

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
    <div className="flex flex-col gap-4 h-full pb-36 animate-in fade-in duration-500 overflow-y-auto">
      
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <LayoutTemplate className="h-6 w-6 text-indigo-600" /> PENSAMENTO A3 (TOYOTA)
          </h2>
          <p className="text-sm text-slate-500 mt-1">Metodologia estruturada para solução de problemas e melhoria contínua.</p>
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
        
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="md:col-span-2">
            <InputField label="Título / Tema" value={data.titulo} onChange={v => onChange({ titulo: v })} />
          </div>
          <InputField label="Data" value={data.data} onChange={v => onChange({ data: v })} type="date" />
          <div className="md:col-span-3">
             <InputField label="Aprovações" value={data.aprovacoes} onChange={v => onChange({ aprovacoes: v })} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
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
  );
}
