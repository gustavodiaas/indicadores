import { type QualidadeData, calcQualidade } from "@/store/useAppStore";
import { InputField } from "@/components/InputField";
import { KpiCard } from "@/components/KpiCard";
import { ComparisonChart } from "@/components/ComparisonChart";

interface Props {
  data: QualidadeData;
  onChange: (d: Partial<QualidadeData>) => void;
}

export function QualidadeModule({ data, onChange }: Props) {
  const r = calcQualidade(data);

  const chartData = [
    { name: "Qualidade (Peças Boas %)", T1: Number(r.indiceT1.toFixed(1)), T3: Number(r.indiceT3.toFixed(1)) },
  ];

  return (
    <div className="flex gap-8 h-full">
      <div className="w-[60%] grid grid-cols-2 gap-x-8 gap-y-6 content-start">
        
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-800 border-b pb-2">Estado Inicial (T1)</h3>
          <InputField label="Quantidade Produzida" value={data.quantidadeT1} onChange={v => onChange({ quantidadeT1: Number(v) || 0 })} suffix="pçs" />
          <InputField label="Perdas (Refugo/Retrabalho)" value={data.perdasT1} onChange={v => onChange({ perdasT1: Number(v) || 0 })} suffix="pçs" />
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-slate-800 border-b pb-2">Estado Final (T3)</h3>
          <InputField label="Quantidade Produzida" value={data.quantidadeT3} onChange={v => onChange({ quantidadeT3: Number(v) || 0 })} suffix="pçs" />
          <InputField label="Perdas (Refugo/Retrabalho)" value={data.perdasT3} onChange={v => onChange({ perdasT3: Number(v) || 0 })} suffix="pçs" />
        </div>
      </div>

      <div className="w-[40%] flex flex-col gap-4 bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="font-semibold text-slate-800 mb-2">Impacto na Qualidade</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <KpiCard label="Índice Qualidade T1" value={r.indiceT1.toFixed(1)} suffix="%" />
          <KpiCard label="Índice Qualidade T3" value={r.indiceT3.toFixed(1)} suffix="%" />
        </div>
        
        <KpiCard label="Aumento de Qualidade" value={r.aumento.toFixed(1)} suffix="%" trend={r.aumento} />
        
        <div className="flex-1 mt-4 min-h-[200px]">
          <ComparisonChart data={chartData} title="Evolução do Índice de Peças Boas" />
        </div>
      </div>
    </div>
  );
}
