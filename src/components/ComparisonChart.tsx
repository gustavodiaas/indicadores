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
      <div className="bg-white dark:bg-[#0A2347] p-3 border border-slate-200 dark:border-[#4A6FA5]/40 rounded-xl shadow-xl text-xs font-semibold text-slate-800 dark:text-slate-200">
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
    <div className="flex flex-col h-full w-full bg-white dark:bg-[#001833] p-6 border border-slate-200 dark:border-[#4A6FA5]/40 rounded-xl shadow-sm">
      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-6">{title}</h4>
      
      <ResponsiveContainer width="100%" height="100%" minHeight={250}>
        <BarChart data={data} margin={{ top: 25, right: 0, left: -20, bottom: 0 }} barGap={8}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
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
          
          <Bar dataKey="T1" fill="currentColor" radius={[4, 4, 0, 0]} name="T1 (Inicial)" maxBarSize={60} className="text-slate-300 dark:text-[#002D72]/40">
            <LabelList dataKey="T1" position="top" fill="currentColor" fontSize={12} fontWeight="bold" className="text-slate-500 dark:text-slate-400" />
          </Bar>
          
          <Bar dataKey="T3" fill="currentColor" radius={[4, 4, 0, 0]} name="T3 (Final)" maxBarSize={60} className="text-[#002D72] dark:text-[#FF6B00]">
            <LabelList dataKey="T3" position="top" fill="currentColor" fontSize={12} fontWeight="bold" className="text-[#002D72] dark:text-[#FF6B00]" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
