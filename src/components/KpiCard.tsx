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
    ? "text-[#002D72] bg-[#002D72]/8 border-[#002D72]/15 dark:text-[#FF6B00] dark:bg-[#FF6B00]/10 dark:border-[#FF6B00]/20" 
    : isNegative 
      ? "text-rose-600 bg-rose-50 border-rose-100 dark:text-rose-400 dark:bg-rose-950/30 dark:border-rose-900/50" 
      : "text-slate-600 bg-slate-50 border-slate-100 dark:text-slate-400 dark:bg-[#002D72]/10 dark:border-[#4A6FA5]/30";
      
  const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  return (
    <div className="flex flex-col p-5 bg-white dark:bg-[#001833] border border-slate-200/80 dark:border-[#4A6FA5]/35 rounded-xl shadow-sm hover:shadow-md hover:border-[#FF6B00]/30 dark:hover:border-[#FF6B00]/40 transition-all duration-300 group">
      <span className="text-sm font-medium text-slate-500 dark:text-slate-400 group-hover:text-[#002D72] dark:group-hover:text-[#FF6B00] transition-colors duration-300">
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
