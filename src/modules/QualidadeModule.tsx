import { type QualidadeData, calcQualidade } from "@/store/useAppStore";
import { T1T3Group } from "@/components/T1T3Group";
import { KpiCard } from "@/components/KpiCard";
import { ComparisonChart } from "@/components/ComparisonChart";

interface Props {
  data: QualidadeData;
  onChange: (d: Partial<QualidadeData>) => void;
}

export function QualidadeModule({ data, onChange }: Props) {
  const r = calcQualidade(data);

  const chartData = [
    { name: "Índice Boas (%)", T1: +r.indiceT1.toFixed(1), T3: +r.indiceT3.toFixed(1) },
  ];

  return (
    <div className="flex gap-6 h-full">
      <div className="w-[60%] space-y-5">
        <h3 className="section-title">Qualidade</h3>
        <T1T3Group label="Quantidade produzida" t1={data.quantidadeT1} t3={data.quantidadeT3}
          onT1={v => onChange({ quantidadeT1: v })} onT3={v => onChange({ quantidadeT3: v })} suffix="pçs" />
        <T1T3Group label="Perdas" t1={data.perdasT1} t3={data.perdasT3}
          onT1={v => onChange({ perdasT1: v })} onT3={v => onChange({ perdasT3: v })} suffix="pçs" />
      </div>
      <div className="w-[40%] space-y-4">
        <h3 className="section-title">Resultados</h3>
        <KpiCard label="Índice Peças Boas (T1)" value={r.indiceT1.toFixed(1)} suffix="%" />
        <KpiCard label="Índice Peças Boas (T3)" value={r.indiceT3.toFixed(1)} suffix="%" />
        <KpiCard label="Aumento de Qualidade" value={r.aumento.toFixed(1)} suffix="p.p." trend={r.aumento} />
        <ComparisonChart data={chartData} title="Comparativo T1 vs T3" />
      </div>
    </div>
  );
}
