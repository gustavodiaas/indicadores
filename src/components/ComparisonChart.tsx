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
  if (data.length === 0) return null;

  return (
    <div className="kpi-card">
      <p className="section-title mb-4">{title}</p>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 25% 89%)" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="T1" fill="hsl(215 20% 65%)" radius={[4, 4, 0, 0]} name="T1 (Inicial)" />
          <Bar dataKey="T3" fill="hsl(221 83% 53%)" radius={[4, 4, 0, 0]} name="T3 (Final)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
