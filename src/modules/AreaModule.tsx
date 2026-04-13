import { type AreaData, calcArea } from "@/store/useAppStore";
import { T1T3Group } from "@/components/T1T3Group";
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
    { name: "Área (m²)", T1: data.areaT1, T3: data.areaT3 },
  ];

  return (
    <div className="flex gap-6 h-full">
      <div className="w-[60%] space-y-5">
        <h3 className="section-title">Área</h3>
        <T1T3Group label="Área" t1={data.areaT1} t3={data.areaT3}
          onT1={v => onChange({ areaT1: v })} onT3={v => onChange({ areaT3: v })} suffix="m²" />
        <InputField label="Valor do Aluguel" value={data.valorAluguel} onChange={v => onChange({ valorAluguel: Number(v) || 0 })} suffix="R$/mês" />
      </div>
      <div className="w-[40%] space-y-4">
        <h3 className="section-title">Resultados</h3>
        <KpiCard label="Redução de Área" value={r.reducaoArea.toFixed(1)} suffix="%" trend={r.reducaoArea} />
        <KpiCard label="Área Liberada" value={r.economiaM2.toFixed(0)} suffix="m²" />
        <KpiCard label="Economia Mensal" value={`R$ ${r.economiaMensal.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`} trend={r.economiaMensal} />
        <ComparisonChart data={chartData} title="Comparativo T1 vs T3" />
      </div>
    </div>
  );
}
