import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Props {
  label: string;
  value: string | number;
  suffix?: string;
  trend?: number;
}

export function KpiCard({ label, value, suffix, trend }: Props) {
  // Em engenharia de produção, contexto importa. Mas visualmente, assumimos que > 0 é crescimento.
  const isPositive = trend !== undefined && trend > 0;
  const isNegative = trend !== undefined && trend < 0;
  
  const trendColor = isPositive ? "text-emerald-600 bg-emerald-100" : isNegative ? "text-rose-600 bg-rose-100" : "text-slate-600 bg-slate-100";
  const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  return (
    <div className="flex flex-col p-5 bg-white border border-slate-200 rounded-xl shadow-sm">
      <span className="text-sm font-medium text-slate-500">{label}</span>
      
      <div className="flex items-baseline gap-2 mt-2">
        <span className="text-3xl font-bold text-slate-800 tracking-tight">{value}</span>
        {suffix && <span className="text-sm font-medium text-slate-500">{suffix}</span>}
      </div>

      {trend !== undefined && (
        <div className="mt-4 flex items-center gap-1.5">
          <span className={`flex items-center justify-center p-1 rounded-md ${trendColor}`}>
            <TrendIcon className="h-3.5 w-3.5" />
          </span>
          <span className="text-xs font-semibold text-slate-600">
            {trend > 0 ? "+" : ""}{trend.toFixed(1)}% em relação ao inicial
          </span>
        </div>
      )}
    </div>
  );
}
