"use client";

import { useState } from "react";

interface MultipleChoiceInputProps {
  options: string[];
  onSubmit: (selected: string[]) => void;
  disabled?: boolean;
}

export function MultipleChoiceInput({ options, onSubmit, disabled }: MultipleChoiceInputProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (opt: string) => {
    if (disabled) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(opt)) next.delete(opt);
      else next.add(opt);
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selected.size > 0) onSubmit(Array.from(selected));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            disabled={disabled}
            className={`flex w-full min-h-[48px] items-center rounded-xl border-2 px-4 py-3 text-left transition ${
              selected.has(opt)
                ? "border-indigo-500 bg-indigo-50 text-indigo-900"
                : "border-gray-200 bg-white text-gray-800 hover:border-indigo-300"
            }`}
          >
            <span className={`mr-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
              selected.has(opt) ? "border-indigo-500 bg-indigo-500" : "border-gray-300"
            }`}>
              {selected.has(opt) && <span className="text-sm text-white">✓</span>}
            </span>
            {opt}
          </button>
        ))}
      </div>
      <div className="flex justify-center">
        <button
          type="submit"
          disabled={selected.size === 0 || disabled}
          className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-8 py-4 text-lg font-medium text-white shadow-lg transition hover:from-indigo-600 hover:to-violet-600 disabled:opacity-50 disabled:hover:from-indigo-500 disabled:hover:to-violet-500"
        >
          Submit
        </button>
      </div>
    </form>
  );
}
