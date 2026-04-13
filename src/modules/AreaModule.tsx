import { type AreaData, calcArea } from "@/store/useAppStore";
import { InputField } from "@/components/InputField";
import { KpiCard } from "@/components/KpiCard";
import { ComparisonChart } from "@/components/ComparisonChart";

interface Props {
  data: AreaData;
  onChange: (d: Partial<AreaData>) => void;
}

export function AreaModule({ data, onChange }: Props) {
  const r = calcArea(data);

  const chartData = [
    { name: "Área Ocupada (m²)", T1: data.areaT1, T3: data.areaT3 },
  ];

  const formatBRL = (val: number) => 
    `R$ ${val.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="flex gap-8 h-full">
      <div className="w-[60%] grid grid-cols-2 gap-x-8 gap-y-6 content-start">
        
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-800 border-b pb-2">Estado Inicial (T1)</h3>
          <InputField label="Área Ocupada" value={data.areaT1} onChange={v => onChange({ areaT1: Number(v) || 0 })} suffix="m²" />
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-slate-800 border-b pb-2">Estado Final (T3)</h3>
          <InputField label="Área Ocupada" value={data.areaT3} onChange={v => onChange({ areaT3: Number(v) || 0 })} suffix="m²" />
        </div>

        <div className="col-span-2 space-y-4 pt-4">
          <h3 className="font-semibold text-slate-800 border-b pb-2">Custos Imobiliários</h3>
          <div className="w-[50%] pr-4">
             <InputField label="Valor do Aluguel (m²)" value={data.valorAluguel} onChange={v => onChange({ valorAluguel: Number(v) || 0 })} suffix="R$/m²" />
          </div>
        </div>
      </div>

      <div className="w-[40%] flex flex-col gap-4 bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="font-semibold text-slate-800 mb-2">Impacto Imobiliário</h3>
        
        <KpiCard label="Redução de Área" value={r.reducaoPercent.toFixed(1)} suffix="%" trend={r.reducaoPercent} />
        
        <div className="grid grid-cols-2 gap-4">
          <KpiCard label="Área Liberada" value={r.economiaM2.toFixed(1)} suffix="m²" />
          <KpiCard label="Economia Mensal" value={formatBRL(r.economiaMensal)} trend={r.economiaMensal} />
        </div>
        
        <div className="flex-1 mt-4 min-h-[200px]">
          <ComparisonChart data={chartData} title="Comparativo T1 vs T3" />
        </div>
      </div>
    </div>
  );
}
