import { type AreaData, calcArea } from "@/store/useAppStore";
import { KpiCard } from "@/components/KpiCard";
import { ComparisonChart } from "@/components/ComparisonChart";
import { EditableLaudoCard } from "@/components/EditableLaudoCard";

interface Props {
  data: AreaData;
  onChange: (d: Partial<AreaData>) => void;
}

function LocalInputField({ label, value, onChange, suffix, type = "number" }: { label: string; value: any; onChange: (v: string) => void; suffix?: string; type?: string }) {
  return (
    <div className="space-y-1.5 w-full">
      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">
        {label}
      </label>
      <div className="relative flex items-center">
        <input
          type={type}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-12 px-4 pr-16 rounded-xl border border-transparent bg-slate-50 dark:bg-[#001022] text-slate-800 dark:text-slate-200 text-sm outline-none focus:ring-2 focus:ring-[#FF6B00] transition-all"
        />
        {suffix && (
          <span className="absolute right-4 text-xs font-bold text-slate-400 dark:text-slate-500 pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

export function AreaModule({ data, onChange }: Props) {
  const r = calcArea(data);
  const chartData = [{ name: "Área (m²)", T1: data.areaT1 || 0, T3: data.areaT3 || 0 }];

  const laudo = `A área ocupada inicial era de ${data.areaT1 || 0}m². Com o novo layout/otimização, reduziu-se para ${data.areaT3 || 0}m², liberando ${r.economiaM2.toFixed(1).replace(".", ",")}m² de área útil (${r.reducaoPercent.toFixed(1).replace(".", ",")}%), gerando uma economia imobiliária mensal de R$ ${r.economiaMensal.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`;

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full animate-in fade-in duration-500">
      {/* Coluna Esquerda: Cards Modernos */}
      <div className="w-full lg:w-[60%] flex flex-col gap-6 overflow-y-auto pr-2 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[#001833] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-[#002D72]/25 space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm tracking-wide uppercase border-b border-slate-100 dark:border-[#002D72]/30 pb-2">Estado T1</h3>
            <LocalInputField label="Área Ocupada" value={data.areaT1} onChange={v => onChange({ areaT1: Number(v) || 0 })} suffix="m²" />
          </div>
          
          <div className="bg-white dark:bg-[#001833] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-[#002D72]/25 space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm tracking-wide uppercase border-b border-slate-100 dark:border-[#002D72]/30 pb-2">Estado T3</h3>
            <LocalInputField label="Área Ocupada" value={data.areaT3} onChange={v => onChange({ areaT3: Number(v) || 0 })} suffix="m²" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-[#001833] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-[#002D72]/25">
          <LocalInputField label="Valor do Aluguel/m²" value={data.valorAluguel} onChange={v => onChange({ valorAluguel: Number(v) || 0 })} suffix="R$/m²" />
        </div>
      </div>

      {/* Coluna Direita: Laudo e Gráfico */}
      <div className="w-full lg:w-[40%] flex flex-col gap-6">
        <KpiCard label="Redução de Área" value={r.reducaoPercent.toFixed(1).replace(".", ",")} suffix="%" trend={r.reducaoPercent} />
        
          <EditableLaudoCard title="Impacto em Área" laudo={laudo} />

        <div className="mt-auto min-h-[250px] bg-white dark:bg-[#001833] rounded-2xl p-4 border border-slate-100 dark:border-[#002D72]/20 shadow-sm">
          <ComparisonChart data={chartData} title="Ocupação de Espaço" />
        </div>
      </div>
    </div>
  );
}
