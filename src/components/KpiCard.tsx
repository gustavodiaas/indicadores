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
    ? "text-emerald-700 bg-emerald-50 border-emerald-100 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20" 
    : isNegative 
      ? "text-rose-600 bg-rose-50 border-rose-100 dark:text-rose-400 dark:bg-rose-950/30 dark:border-rose-900/50" 
      : "text-slate-600 bg-slate-100 border-slate-200 dark:text-slate-400 dark:bg-white/[0.06] dark:border-white/10";
      
  const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  return (
    <div className="relative overflow-hidden flex flex-col p-5 bg-white/80 dark:bg-[#1C1C1E]/90 border border-black/[0.04] dark:border-white/[0.07] rounded-[20px] shadow-[0_14px_38px_rgba(15,23,42,0.05)] backdrop-blur-xl transition-all duration-200 group before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-gradient-to-r before:from-[#0A84FF] before:via-[#30B76B] before:to-[#FF6B00]">
      <span className="text-[13px] font-medium text-slate-500 dark:text-slate-400">
        {label}
      </span>
      
      <div className="flex items-baseline gap-2 mt-2">
        <span className="text-[32px] font-semibold text-slate-900 dark:text-white tracking-[-0.03em]">{value}</span>
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
