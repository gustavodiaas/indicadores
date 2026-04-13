import { type LeadTimeData, calcLeadTime } from "@/store/useAppStore";
import { T1T3Group } from "@/components/T1T3Group";
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
    <div className="flex gap-6 h-full">
      <div className="w-[60%] space-y-5">
        <h3 className="section-title">Lead Time</h3>
        <T1T3Group label="Lead Time" t1={data.leadTimeT1} t3={data.leadTimeT3}
          onT1={v => onChange({ leadTimeT1: v })} onT3={v => onChange({ leadTimeT3: v })} suffix="dias" />
      </div>
      <div className="w-[40%] space-y-4">
        <h3 className="section-title">Resultados</h3>
        <KpiCard label="Redução de Lead Time" value={r.reducao.toFixed(1)} suffix="%" trend={r.reducao} />
        <ComparisonChart data={chartData} title="Comparativo T1 vs T3" />
      </div>
    </div>
  );
}
