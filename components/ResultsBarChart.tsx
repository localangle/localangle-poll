"use client";

import { motion } from "framer-motion";

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

  const totalVotes = chartData.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="space-y-5">
      {chartData.map((d) => (
        <div key={d.option}>
          <div className="mb-2 text-xl font-medium text-gray-900">
            {d.option}
          </div>
          <div className="flex items-center gap-4">
            <div className="relative h-12 flex-1 overflow-hidden rounded-lg bg-gray-200">
              <motion.div
                className="h-full rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500"
                initial={{ width: 0 }}
                animate={{ width: totalVotes > 0 ? `${(d.count / totalVotes) * 100}%` : "0%" }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <span className="w-24 shrink-0 text-right text-xl font-medium text-indigo-600">
              {d.count} ({d.percentage}%)
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
