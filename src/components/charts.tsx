"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import type { Category } from "@/types/expense";

/* ─── Monthly bar chart ─── */
interface MonthlyChartProps {
  data: { month: string; total: number; person1: number; person2: number }[];
}

export function MonthlyBarChart({ data }: MonthlyChartProps) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-foreground/40">
        Расходы по месяцам
      </p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: "var(--foreground)" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--foreground)" }}
              tickLine={false}
              axisLine={false}
              width={50}
            />
            <Tooltip
              contentStyle={{
                background: "rgba(255,255,255,0.9)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: "12px",
                fontSize: "12px",
              }}
            />
            <Bar
              dataKey="person1"
              stackId="a"
              fill="#22c55e"
              radius={[0, 0, 0, 0]}
              name="Партнёр 1"
            />
            <Bar
              dataKey="person2"
              stackId="a"
              fill="#f472b6"
              radius={[4, 4, 0, 0]}
              name="Партнёр 2"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ─── Category pie chart ─── */
interface CategoryPieProps {
  data: { name: string; value: number; color: string }[];
  total: number;
  currency: string;
}

export function CategoryPieChart({ data, total, currency }: CategoryPieProps) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-foreground/40">
        По категориям
      </p>
      <div className="flex items-center gap-4">
        <div className="h-48 w-48 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val) =>
                  `${currency} ${Number(val).toLocaleString("ru-RU")}`
                }
                contentStyle={{
                  background: "rgba(255,255,255,0.9)",
                  backdropFilter: "blur(16px)",
                  border: "1px solid rgba(0,0,0,0.08)",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          {data.slice(0, 6).map((d) => (
            <div key={d.name} className="flex items-center gap-2 text-xs">
              <div
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: d.color }}
              />
              <span className="truncate text-foreground/60">{d.name}</span>
              <span className="ml-auto font-semibold tabular-nums">
                {total > 0 ? ((d.value / total) * 100).toFixed(0) : 0}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Spending trend area chart ─── */
interface TrendChartProps {
  data: { date: string; amount: number }[];
}

export function SpendingTrendChart({ data }: TrendChartProps) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-foreground/40">
        Тренд расходов
      </p>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "var(--foreground)" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "var(--foreground)" }}
              tickLine={false}
              axisLine={false}
              width={45}
            />
            <Tooltip
              contentStyle={{
                background: "rgba(255,255,255,0.9)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: "12px",
                fontSize: "12px",
              }}
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#22c55e"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorAmt)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ─── Person comparison bar chart ─── */
interface PersonCompareProps {
  data: { category: string; person1: number; person2: number }[];
  categories: Category[];
}

export function PersonCompareChart({ data }: PersonCompareProps) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-foreground/40">
        Сравнение расходов
      </p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" barGap={2}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(0,0,0,0.06)"
              horizontal={false}
            />
            <XAxis
              type="number"
              tick={{ fontSize: 10, fill: "var(--foreground)" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type="category"
              dataKey="category"
              tick={{ fontSize: 10, fill: "var(--foreground)" }}
              tickLine={false}
              axisLine={false}
              width={80}
            />
            <Tooltip
              contentStyle={{
                background: "rgba(255,255,255,0.9)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: "12px",
                fontSize: "12px",
              }}
            />
            <Bar
              dataKey="person1"
              fill="#22c55e"
              radius={[0, 4, 4, 0]}
              name="Партнёр 1"
            />
            <Bar
              dataKey="person2"
              fill="#f472b6"
              radius={[0, 4, 4, 0]}
              name="Партнёр 2"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
