import { type LeadTimeData, calcLeadTime } from "@/store/useAppStore";
import { InputField } from "@/components/InputField";
import { KpiCard } from "@/components/KpiCard";
import { ComparisonChart } from "@/components/ComparisonChart";

interface Props {
  data: LeadTimeData;
  onChange: (d: Partial<LeadTimeData>) => void;
}

export function LeadTimeModule({ data, onChange }: Props) {
  const r = calcLeadTime(data);

  const chartData = [
    { name: "Lead Time (dias)", T1: data.leadTimeT1, T3: data.leadTimeT3 },
  ];

  return (
    <div className="flex gap-8 h-full">
      <div className="w-[60%] grid grid-cols-2 gap-x-8 gap-y-6 content-start">
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-800 border-b pb-2">Estado Inicial (T1)</h3>
          <InputField label="Tempo de Atravessamento" value={data.leadTimeT1} onChange={v => onChange({ leadTimeT1: Number(v) || 0 })} suffix="dias" />
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-slate-800 border-b pb-2">Estado Final (T3)</h3>
          <InputField label="Tempo de Atravessamento" value={data.leadTimeT3} onChange={v => onChange({ leadTimeT3: Number(v) || 0 })} suffix="dias" />
        </div>
      </div>

      <div className="w-[40%] flex flex-col gap-4 bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="font-semibold text-slate-800 mb-2">Velocidade de Entrega</h3>
        
        <KpiCard label="Redução de Lead Time" value={r.reducao.toFixed(1)} suffix="%" trend={r.reducao} />
        
        <div className="flex-1 mt-4 min-h-[200px]">
          <ComparisonChart data={chartData} title="Encurtamento do Lead Time" />
        </div>
      </div>
    </div>
  );
}
