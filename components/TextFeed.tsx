"use client";

import { motion } from "framer-motion";

interface TextFeedProps {
  responses: { id: number; response_value: string }[];
}

export function TextFeed({ responses }: TextFeedProps) {
  const visible = [...responses].reverse();

  return (
    <div className="max-h-[60vh] overflow-y-auto">
      <div className="grid grid-cols-3 gap-4">
        {visible.map((r) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="rounded-xl border border-gray-200 bg-white px-6 py-4 shadow-sm"
          >
            <p className="text-lg text-gray-900">{r.response_value}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
