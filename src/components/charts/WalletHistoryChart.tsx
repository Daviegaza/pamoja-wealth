import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCompactNumber, formatDate } from "@/lib/utils";
import type { WalletHistoryPoint } from "@/types";

export function WalletHistoryChart({ data }: { data: WalletHistoryPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="walletGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#16a34a" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#16a34a" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
        <XAxis dataKey="date" tickFormatter={(d) => formatDate(d, { day: "numeric", month: "short" })} tickLine={false} axisLine={false} fontSize={11} stroke="#9ca3af" minTickGap={30} />
        <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#9ca3af" tickFormatter={formatCompactNumber} width={48} />
        <Tooltip labelFormatter={(d) => formatDate(String(d))} formatter={(value) => formatCompactNumber(Number(value))} contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 13 }} />
        <Area type="monotone" dataKey="balance" stroke="#16a34a" strokeWidth={2.5} fill="url(#walletGradient)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
