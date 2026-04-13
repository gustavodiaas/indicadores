import { type DisponibilidadeData, calcDisponibilidade } from "@/store/useAppStore";
import { T1T3Group } from "@/components/T1T3Group";
import { KpiCard } from "@/components/KpiCard";
import { ComparisonChart } from "@/components/ComparisonChart";

interface Props {
  data: DisponibilidadeData;
  onChange: (d: Partial<DisponibilidadeData>) => void;
}

export function DisponibilidadeModule({ data, onChange }: Props) {
  const r = calcDisponibilidade(data);

  const chartData = [
    { name: "Disponibilidade (%)", T1: +r.dispT1.toFixed(1), T3: +r.dispT3.toFixed(1) },
  ];

  return (
    <div className="flex gap-6 h-full">
      <div className="w-[60%] space-y-5">
        <h3 className="section-title">Disponibilidade</h3>
        <T1T3Group label="Tempo total" t1={data.tempoTotalT1} t3={data.tempoTotalT3}
          onT1={v => onChange({ tempoTotalT1: v })} onT3={v => onChange({ tempoTotalT3: v })} suffix="min" />
        <T1T3Group label="Paradas planejadas" t1={data.paradasPlanT1} t3={data.paradasPlanT3}
          onT1={v => onChange({ paradasPlanT1: v })} onT3={v => onChange({ paradasPlanT3: v })} suffix="min" />
        <T1T3Group label="Paradas não planejadas" t1={data.paradasNaoPlanT1} t3={data.paradasNaoPlanT3}
          onT1={v => onChange({ paradasNaoPlanT1: v })} onT3={v => onChange({ paradasNaoPlanT3: v })} suffix="min" />
      </div>
      <div className="w-[40%] space-y-4">
        <h3 className="section-title">Resultados</h3>
        <KpiCard label="Disponibilidade (T1)" value={r.dispT1.toFixed(1)} suffix="%" />
        <KpiCard label="Disponibilidade (T3)" value={r.dispT3.toFixed(1)} suffix="%" />
        <KpiCard label="Aumento" value={r.aumento.toFixed(1)} suffix="p.p." trend={r.aumento} />
        <ComparisonChart data={chartData} title="Comparativo T1 vs T3" />
      </div>
    </div>
  );
}
