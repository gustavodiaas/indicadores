import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from "recharts";

interface ChartItem {
  name: string;
  T1: number;
  T3: number;
}

interface Props {
  data: ChartItem[];
  title: string;
}

// Tooltip premium customizado para aceitar classes dark nativas do Tailwind
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 dark:bg-[#2C2C2E]/95 backdrop-blur-xl p-3 border border-black/[0.06] dark:border-white/10 rounded-xl shadow-[0_12px_30px_rgba(0,0,0,0.14)] text-xs font-medium text-slate-800 dark:text-slate-200">
        <p className="mb-1.5 text-slate-400 dark:text-slate-500">{payload[0].payload.name}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} style={{ color: p.fill }} className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.fill }} />
            {p.name}: <span className="font-bold">{p.value}%</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function ComparisonChart({ data, title }: Props) {
  if (!data || data.length === 0) return null;

  return (
    <div className="flex flex-col h-full w-full bg-white/80 dark:bg-[#1C1C1E]/90 p-5 border border-black/[0.04] dark:border-white/[0.07] rounded-[20px] shadow-[0_14px_38px_rgba(15,23,42,0.05)] backdrop-blur-xl">
      <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-5 tracking-tight">{title}</h4>
      
      <ResponsiveContainer width="100%" height="100%" minHeight={250}>
        <BarChart data={data} margin={{ top: 25, right: 0, left: -20, bottom: 0 }} barGap={8}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200/80 dark:text-white/10" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12, fontWeight: 500 }} 
            className="fill-slate-500 dark:fill-slate-400"
            axisLine={false} 
            tickLine={false} 
          />
          <YAxis 
            tick={{ fontSize: 12 }} 
            className="fill-slate-500 dark:fill-slate-400"
            axisLine={false} 
            tickLine={false} 
          />
          <Tooltip cursor={{ fill: 'currentColor', className: 'text-slate-100/50 dark:text-slate-950/30' }} content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 500 }} iconType="circle" />
          
          <Bar dataKey="T1" fill="currentColor" radius={[8, 8, 2, 2]} name="T1 (Inicial)" maxBarSize={54} className="text-[#0A84FF] dark:text-[#409CFF]">
            <LabelList dataKey="T1" position="top" fill="currentColor" fontSize={12} fontWeight="600" className="text-[#0A84FF] dark:text-[#409CFF]" />
          </Bar>
          
          <Bar dataKey="T3" fill="currentColor" radius={[8, 8, 2, 2]} name="T3 (Final)" maxBarSize={54} className="text-[#30B76B] dark:text-[#32D74B]">
            <LabelList dataKey="T3" position="top" fill="currentColor" fontSize={12} fontWeight="600" className="text-[#30B76B] dark:text-[#32D74B]" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
