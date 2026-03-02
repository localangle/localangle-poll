"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface HistogramProps {
  data: { value: number; count: number }[];
}

export function Histogram({ data }: HistogramProps) {
  const chartData = Array.from({ length: 10 }, (_, i) => {
    const value = i + 1;
    const item = data.find((d) => d.value === value);
    return { value, count: item?.count ?? 0, name: String(value) };
  });

  const maxCount = Math.max(...chartData.map((d) => d.count), 1);

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
        >
          <XAxis
            dataKey="name"
            tick={{ fontSize: 20, fill: "#374151" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="number"
            domain={[0, maxCount]}
            tick={{ fontSize: 18, fill: "#6b7280" }}
            axisLine={false}
            tickLine={false}
            width={50}
          />
          <Bar
            dataKey="count"
            radius={[8, 8, 0, 0]}
            maxBarSize={60}
            animationDuration={500}
            animationEasing="ease-out"
          >
            {chartData.map((entry) => (
              <Cell
                key={entry.value}
                fill={
                  entry.count > 0
                    ? "url(#histogramGradient)"
                    : "rgba(229, 231, 235, 0.5)"
                }
              />
            ))}
          </Bar>
          <defs>
            <linearGradient id="histogramGradient" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
