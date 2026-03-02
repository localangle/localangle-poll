"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface ResultsBarChartProps {
  options: string[];
  data: { option: string; count: number; percentage: number }[];
}

export function ResultsBarChart({ options, data }: ResultsBarChartProps) {
  const chartData = options.map((opt) => {
    const item = data.find((d) => d.option === opt);
    return {
      option: opt,
      count: item?.count ?? 0,
      percentage: item?.percentage ?? 0,
    };
  });

  const maxCount = Math.max(...chartData.map((d) => d.count), 1);

  return (
    <div className="h-96 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
        >
          <XAxis type="number" domain={[0, maxCount]} hide />
          <YAxis
            type="category"
            dataKey="option"
            width={200}
            tick={{ fontSize: 22, fill: "#374151" }}
            axisLine={false}
            tickLine={false}
          />
          <Bar
            dataKey="count"
            radius={[0, 8, 8, 0]}
            maxBarSize={56}
            animationDuration={500}
            animationEasing="ease-out"
          >
            {chartData.map((entry, i) => (
              <Cell
                key={entry.option}
                fill={
                  entry.count > 0
                    ? "url(#barChartGradient)"
                    : "rgba(229, 231, 235, 0.5)"
                }
              />
            ))}
          </Bar>
          <defs>
            <linearGradient id="barChartGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4 space-y-2">
        {chartData.map((d) => (
          <div key={d.option} className="flex items-center justify-between text-lg">
            <span className="font-medium text-gray-900">{d.option}</span>
            <span className="text-indigo-600">
              {d.count} ({d.percentage}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
