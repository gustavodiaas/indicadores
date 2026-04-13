import { type DisponibilidadeData, calcDisponibilidade } from "@/store/useAppStore";
import { InputField } from "@/components/InputField";
import { KpiCard } from "@/components/KpiCard";
import { ComparisonChart } from "@/components/ComparisonChart";

interface Props {
  data: DisponibilidadeData;
  onChange: (d: Partial<DisponibilidadeData>) => void;
}

export function DisponibilidadeModule({ data, onChange }: Props) {
  const r = calcDisponibilidade(data);

  const chartData = [
    { name: "Disponibilidade Máquina (%)", T1: Number(r.indT1.toFixed(1)), T3: Number(r.indT3.toFixed(1)) },
  ];

  return (
    <div className="flex gap-8 h-full">
      <div className="w-[60%] grid grid-cols-2 gap-x-8 gap-y-6 content-start">
        
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-800 border-b pb-2">Estado Inicial (T1)</h3>
          <InputField label="Tempo Total" value={data.tempoTotalT1} onChange={v => onChange({ tempoTotalT1: Number(v) || 0 })} />
          <InputField label="Paradas Planejadas" value={data.paradasPlanT1} onChange={v => onChange({ paradasPlanT1: Number(v) || 0 })} />
          <InputField label="Paradas Não Planejadas" value={data.paradasNaoPlanT1} onChange={v => onChange({ paradasNaoPlanT1: Number(v) || 0 })} />
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-slate-800 border-b pb-2">Estado Final (T3)</h3>
          <InputField label="Tempo Total" value={data.tempoTotalT3} onChange={v => onChange({ tempoTotalT3: Number(v) || 0 })} />
          <InputField label="Paradas Planejadas" value={data.paradasPlanT3} onChange={v => onChange({ paradasPlanT3: Number(v) || 0 })} />
          <InputField label="Paradas Não Planejadas" value={data.paradasNaoPlanT3} onChange={v => onChange({ paradasNaoPlanT3: Number(v) || 0 })} />
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
        <h3 className="font-semibold text-slate-800 mb-2">Impacto em Disponibilidade</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <KpiCard label="Disponibilidade T1" value={r.indT1.toFixed(1)} suffix="%" />
          <KpiCard label="Disponibilidade T3" value={r.indT3.toFixed(1)} suffix="%" />
        </div>
        
        <KpiCard label="Aumento Operacional" value={r.aumento.toFixed(1)} suffix="%" trend={r.aumento} />
        
        <div className="flex-1 mt-4 min-h-[200px]">
          <ComparisonChart data={chartData} title="Evolução da Disponibilidade" />
        </div>
      </div>
    </div>
  );
}
