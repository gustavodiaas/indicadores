import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface ChartItem {
  name: string;
  T1: number;
  T3: number;
}

interface Props {
  data: ChartItem[];
  title: string;
}

export function ComparisonChart({ data, title }: Props) {
  if (!data || data.length === 0) return null;

  return (
    <div className="flex flex-col h-full w-full bg-white p-6 border border-slate-200 rounded-xl shadow-sm">
      <h4 className="text-sm font-bold text-slate-800 mb-6">{title}</h4>
      
      <ResponsiveContainer width="100%" height="100%" minHeight={250}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barGap={8}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12, fill: "#64748B", fontWeight: 500 }} 
            axisLine={false} 
            tickLine={false} 
          />
          <YAxis 
            tick={{ fontSize: 12, fill: "#64748B" }} 
            axisLine={false} 
            tickLine={false} 
          />
          <Tooltip 
            cursor={{ fill: '#F8FAFC' }}
            contentStyle={{ 
              borderRadius: '0.5rem', 
              border: '1px solid #E2E8F0', 
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              fontSize: '12px',
              fontWeight: 500
            }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 500 }} iconType="circle" />
          
          <Bar dataKey="T1" fill="#94A3B8" radius={[4, 4, 0, 0]} name="T1 (Inicial)" maxBarSize={60} />
          <Bar dataKey="T3" fill="#2563EB" radius={[4, 4, 0, 0]} name="T3 (Final)" maxBarSize={60} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
