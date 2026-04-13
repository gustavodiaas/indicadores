import { type ProdutividadeData, calcProdutividade } from "@/store/useAppStore";
import { InputField } from "@/components/InputField";
import { KpiCard } from "@/components/KpiCard";
import { ComparisonChart } from "@/components/ComparisonChart";

interface Props {
  data: ProdutividadeData;
  onChange: (d: Partial<ProdutividadeData>) => void;
}

export function ProdutividadeModule({ data, onChange }: Props) {
  const r = calcProdutividade(data);

  // Gráfico focado exclusivamente na eficiência. Misturar Volume aqui distorceria a escala visual.
  const chartData = [
    { name: "Produtividade (pçs/h/op)", T1: Number(r.pphT1.toFixed(2)), T3: Number(r.pphT3.toFixed(2)) },
  ];

  return (
    <div className="flex gap-8 h-full">
      {/* Formulários Estratégicos */}
      <div className="w-[60%] grid grid-cols-2 gap-x-8 gap-y-6 content-start">
        
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-800 border-b pb-2">Estado Inicial (T1)</h3>
          <InputField label="Volume Produzido (peças)" value={data.volumeT1} onChange={v => onChange({ volumeT1: Number(v) || 0 })} />
          <InputField label="Horas do Turno (h)" value={data.horasT1} onChange={v => onChange({ horasT1: Number(v) || 0 })} />
          <InputField label="Nº de Operadores" value={data.operadoresT1} onChange={v => onChange({ operadoresT1: Number(v) || 0 })} />
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-slate-800 border-b pb-2">Estado Final (T3)</h3>
          <InputField label="Volume Produzido (peças)" value={data.volumeT3} onChange={v => onChange({ volumeT3: Number(v) || 0 })} />
          <InputField label="Horas do Turno (h)" value={data.horasT3} onChange={v => onChange({ horasT3: Number(v) || 0 })} />
          <InputField label="Nº de Operadores" value={data.operadoresT3} onChange={v => onChange({ operadoresT3: Number(v) || 0 })} />
        </div>
      </div>

      {/* Dashboard de Impacto */}
      <div className="w-[40%] flex flex-col gap-4 bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="font-semibold text-slate-800 mb-2">Impacto Operacional</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <KpiCard label="Produtividade T1" value={r.pphT1.toFixed(2)} suffix="pçs/h" />
          <KpiCard label="Produtividade T3" value={r.pphT3.toFixed(2)} suffix="pçs/h" />
        </div>
        
        <KpiCard 
          label="Ganho de Produtividade" 
          value={r.ganho.toFixed(2)} 
          suffix="%" 
          trend={r.ganho} 
        />
        
        <div className="flex-1 mt-4 min-h-[200px]">
          <ComparisonChart data={chartData} title="Evolução da Eficiência" />
        </div>
      </div>
    </div>
  );
}
