import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Props {
  label: string;
  value: string;
  suffix?: string;
  trend?: number; // positive = good
}

export function KpiCard({ label, value, suffix, trend }: Props) {
  const trendColor = trend === undefined ? "" : trend > 0 ? "text-kpi-positive" : trend < 0 ? "text-kpi-negative" : "text-muted-foreground";
  const TrendIcon = trend === undefined ? null : trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;

  return (
    <div className="kpi-card">
      <p className="kpi-label">{label}</p>
      <div className="flex items-end gap-2 mt-1">
        <span className="kpi-value">{value}</span>
        {suffix && <span className="text-sm text-muted-foreground mb-1">{suffix}</span>}
        {TrendIcon && <TrendIcon className={`h-5 w-5 mb-1 ${trendColor}`} />}
      </div>
    </div>
  );
}
