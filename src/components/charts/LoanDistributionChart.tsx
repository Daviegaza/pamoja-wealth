import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#16a34a", "#2563eb", "#f97316", "#7c3aed", "#dc2626"];

export function LoanDistributionChart({ data }: { data: { category: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="category" cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={3}>
          {data.map((_, idx) => (
            <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 13 }} />
        <Legend iconType="circle" />
      </PieChart>
    </ResponsiveContainer>
  );
}
