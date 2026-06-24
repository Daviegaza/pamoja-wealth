import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCompactNumber } from "@/lib/utils";

export function CashFlowChart({ data }: { data: { month: string; inflow: number; outflow: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" className="dark:opacity-[0.04]" />
        <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="#9ca3af" />
        <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#9ca3af" tickFormatter={formatCompactNumber} width={52} />
        <Tooltip
          formatter={(value) => [formatCompactNumber(Number(value)), "Amount"]}
          contentStyle={{
            borderRadius: 14,
            border: "1px solid rgba(0,0,0,0.06)",
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(12px)",
            fontSize: 13,
            fontWeight: 500,
            boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
          }}
        />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ paddingTop: 16, fontSize: 13 }} />
        <Bar dataKey="inflow" fill="url(#inflowGradient)" radius={[8, 8, 0, 0]} name="Inflow" />
        <Bar dataKey="outflow" fill="#f97316" radius={[8, 8, 0, 0]} name="Outflow" opacity={0.8} />
        <defs>
          <linearGradient id="inflowGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>
        </defs>
      </BarChart>
    </ResponsiveContainer>
  );
}
