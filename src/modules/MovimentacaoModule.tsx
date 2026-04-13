import { type MovimentacaoData, calcMovimentacao } from "@/store/useAppStore";
import { T1T3Group } from "@/components/T1T3Group";
import { KpiCard } from "@/components/KpiCard";
import { ComparisonChart } from "@/components/ComparisonChart";

interface Props {
  data: MovimentacaoData;
  onChange: (d: Partial<MovimentacaoData>) => void;
}

export function MovimentacaoModule({ data, onChange }: Props) {
  const r = calcMovimentacao(data);

  const chartData = [
    { name: "Distância (m)", T1: data.distanciaT1, T3: data.distanciaT3 },
    { name: "Tempo (min)", T1: data.tempoT1, T3: data.tempoT3 },
  ];

  return (
    <div className="flex gap-6 h-full">
      <div className="w-[60%] space-y-5">
        <h3 className="section-title">Movimentação</h3>
        <T1T3Group label="Distância" t1={data.distanciaT1} t3={data.distanciaT3}
          onT1={v => onChange({ distanciaT1: v })} onT3={v => onChange({ distanciaT3: v })} suffix="metros" />
        <T1T3Group label="Tempo" t1={data.tempoT1} t3={data.tempoT3}
          onT1={v => onChange({ tempoT1: v })} onT3={v => onChange({ tempoT3: v })} suffix="min" />
      </div>
      <div className="w-[40%] space-y-4">
        <h3 className="section-title">Resultados</h3>
        <KpiCard label="Redução de Distância" value={r.reducaoDist.toFixed(1)} suffix="%" trend={r.reducaoDist} />
        <KpiCard label="Redução de Tempo" value={r.reducaoTempo.toFixed(1)} suffix="%" trend={r.reducaoTempo} />
        <ComparisonChart data={chartData} title="Comparativo T1 vs T3" />
      </div>
    </div>
  );
}
