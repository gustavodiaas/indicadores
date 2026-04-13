import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Props {
  label: string;
  value: string | number;
  suffix?: string;
  trend?: number;
}

export function KpiCard({ label, value, suffix, trend }: Props) {
  const isPositive = trend !== undefined && trend > 0;
  const isNegative = trend !== undefined && trend < 0;
  
  const trendColor = isPositive ? "text-emerald-600 bg-emerald-50 border-emerald-100" : isNegative ? "text-rose-600 bg-rose-50 border-rose-100" : "text-slate-600 bg-slate-50 border-slate-100";
  const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  return (
    <div className="flex flex-col p-5 bg-white border border-slate-200/80 rounded-xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300 group">
      <span className="text-sm font-medium text-slate-500 group-hover:text-blue-600 transition-colors duration-300">
        {label}
      </span>
      
      <div className="flex items-baseline gap-2 mt-2">
        <span className="text-3xl font-extrabold text-slate-800 tracking-tight">{value}</span>
        {suffix && <span className="text-sm font-semibold text-slate-400">{suffix}</span>}
      </div>

      {trend !== undefined && (
        <div className="mt-4 flex items-center gap-2">
          <span className={`flex items-center justify-center p-1.5 rounded-md border ${trendColor} transition-colors`}>
            <TrendIcon className="h-3.5 w-3.5 stroke-[2.5]" />
          </span>
          <span className="text-xs font-semibold text-slate-500">
            {trend > 0 ? "+" : ""}{trend.toFixed(1)}% vs Inicial
          </span>
        </div>
      )}
    </div>
  );
}
