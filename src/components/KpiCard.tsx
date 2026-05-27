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
  
  const trendColor = isPositive 
    ? "text-emerald-600 bg-emerald-50 border-emerald-100 dark:text-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-900/50" 
    : isNegative 
      ? "text-rose-600 bg-rose-50 border-rose-100 dark:text-rose-400 dark:bg-rose-950/30 dark:border-rose-900/50" 
      : "text-slate-600 bg-slate-50 border-slate-100 dark:text-slate-400 dark:bg-slate-950/30 dark:border-slate-900/50";
      
  const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  return (
    <div className="flex flex-col p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-500/50 transition-all duration-300 group">
      <span className="text-sm font-medium text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
        {label}
      </span>
      
      <div className="flex items-baseline gap-2 mt-2">
        <span className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">{value}</span>
        {suffix && <span className="text-sm font-semibold text-slate-400 dark:text-slate-500">{suffix}</span>}
      </div>

      {trend !== undefined && (
        <div className="mt-4 flex items-center gap-2">
          <span className={`flex items-center justify-center p-1.5 rounded-md border ${trendColor} transition-colors`}>
            <TrendIcon className="h-3.5 w-3.5 stroke-[2.5]" />
          </span>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {trend > 0 ? "+" : ""}{trend.toFixed(1)}% vs Inicial
          </span>
        </div>
      )}
    </div>
  );
}
