"use client";

import { useState } from "react";

interface NumericInputProps {
  onSubmit: (value: number) => void;
  disabled?: boolean;
}

export function NumericInput({ onSubmit, disabled }: NumericInputProps) {
  const [selected, setSelected] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selected !== null) onSubmit(selected);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setSelected(n)}
            disabled={disabled}
            className={`flex h-14 w-14 min-w-[3.5rem] items-center justify-center rounded-full text-lg font-semibold transition sm:h-16 sm:w-16 sm:min-w-[4rem] sm:text-xl ${
              selected === n
                ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg"
                : "border-2 border-gray-300 bg-white text-gray-700 hover:border-indigo-400 hover:bg-indigo-50"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-center">
        <button
          type="submit"
          disabled={selected === null || disabled}
          className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-8 py-4 text-lg font-medium text-white shadow-lg transition hover:from-indigo-600 hover:to-violet-600 disabled:opacity-50 disabled:hover:from-indigo-500 disabled:hover:to-violet-500"
        >
          Submit
        </button>
      </div>
    </form>
  );
}
