import { type ProdutividadeData, calcProdutividade } from "@/store/useAppStore";
import { T1T3Group } from "@/components/T1T3Group";
import { KpiCard } from "@/components/KpiCard";
import { ComparisonChart } from "@/components/ComparisonChart";

interface Props {
  data: ProdutividadeData;
  onChange: (d: Partial<ProdutividadeData>) => void;
}

export function ProdutividadeModule({ data, onChange }: Props) {
  const r = calcProdutividade(data);

  const chartData = [
    { name: "Peças/h/op", T1: +r.pphT1.toFixed(2), T3: +r.pphT3.toFixed(2) },
    { name: "Volume", T1: data.volumeT1, T3: data.volumeT3 },
  ];

  return (
    <div className="flex gap-6 h-full">
      <div className="w-[60%] space-y-5">
        <h3 className="section-title">Produtividade</h3>
        <T1T3Group label="Volume produzido" t1={data.volumeT1} t3={data.volumeT3}
          onT1={v => onChange({ volumeT1: v })} onT3={v => onChange({ volumeT3: v })} suffix="pçs" />
        <T1T3Group label="Horas do turno" t1={data.horasT1} t3={data.horasT3}
          onT1={v => onChange({ horasT1: v })} onT3={v => onChange({ horasT3: v })} suffix="h" />
        <T1T3Group label="Nº de operadores" t1={data.operadoresT1} t3={data.operadoresT3}
          onT1={v => onChange({ operadoresT1: v })} onT3={v => onChange({ operadoresT3: v })} />
      </div>
      <div className="w-[40%] space-y-4">
        <h3 className="section-title">Resultados</h3>
        <KpiCard label="Peças/hora/operador (T1)" value={r.pphT1.toFixed(2)} />
        <KpiCard label="Peças/hora/operador (T3)" value={r.pphT3.toFixed(2)} />
        <KpiCard label="Ganho de Produtividade" value={r.ganho.toFixed(1)} suffix="%" trend={r.ganho} />
        <ComparisonChart data={chartData} title="Comparativo T1 vs T3" />
      </div>
    </div>
  );
}
