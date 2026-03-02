"use client";

import { motion } from "framer-motion";

interface TextFeedProps {
  responses: { id: number; response_value: string }[];
}

const MAX_VISIBLE = 20;

export function TextFeed({ responses }: TextFeedProps) {
  const visible = responses.slice(-MAX_VISIBLE).reverse();

  return (
    <div className="max-h-[60vh] overflow-y-auto">
      <div className="space-y-3 pr-2">
        {visible.map((r) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-xl border border-gray-200 bg-white px-6 py-4 shadow-sm"
          >
            <p className="text-xl text-gray-900">{r.response_value}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
