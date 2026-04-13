import { type MovimentacaoData, calcMovimentacao } from "@/store/useAppStore";
import { InputField } from "@/components/InputField";
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
    { name: "Tempo", T1: data.tempoT1, T3: data.tempoT3 },
  ];

  return (
    <div className="flex gap-8 h-full">
      <div className="w-[60%] grid grid-cols-2 gap-x-8 gap-y-6 content-start">
        
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-800 border-b pb-2">Estado Inicial (T1)</h3>
          <InputField label="Distância (Ida e Volta)" value={data.distanciaT1} onChange={v => onChange({ distanciaT1: Number(v) || 0 })} suffix="metros" />
          <InputField label="Tempo Gasto" value={data.tempoT1} onChange={v => onChange({ tempoT1: Number(v) || 0 })} />
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-slate-800 border-b pb-2">Estado Final (T3)</h3>
          <InputField label="Distância (Ida e Volta)" value={data.distanciaT3} onChange={v => onChange({ distanciaT3: Number(v) || 0 })} suffix="metros" />
          <InputField label="Tempo Gasto" value={data.tempoT3} onChange={v => onChange({ tempoT3: Number(v) || 0 })} />
        </div>

        <div className="col-span-2 pt-2">
           <label className="block text-sm font-medium text-slate-700 mb-1">Unidade de Tempo Utilizada</label>
           <select 
             className="w-[50%] flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
             value={data.unidadeTempo || "minutos"} 
             onChange={e => onChange({ unidadeTempo: e.target.value as any })}
           >
             <option value="segundos">Segundos</option>
             <option value="minutos">Minutos</option>
             <option value="horas">Horas</option>
           </select>
        </div>
      </div>

      <div className="w-[40%] flex flex-col gap-4 bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="font-semibold text-slate-800 mb-2">Redução de Desperdícios</h3>
        
        <KpiCard label="Redução de Distância" value={r.reducaoDist.toFixed(1)} suffix="%" trend={r.reducaoDist} />
        <KpiCard label={`Redução de Tempo (${data.unidadeTempo || "minutos"})`} value={r.reducaoTempo.toFixed(1)} suffix="%" trend={r.reducaoTempo} />
        
        <div className="flex-1 mt-4 min-h-[200px]">
          <ComparisonChart data={chartData} title="Comparativo T1 vs T3" />
        </div>
      </div>
    </div>
  );
}
