"use client";

import { useState } from "react";

const MAX_LENGTH = 280;

interface FreeTextInputProps {
  onSubmit: (value: string) => void;
  disabled?: boolean;
}

export function FreeTextInput({ onSubmit, disabled }: FreeTextInputProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed) onSubmit(trimmed);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value.slice(0, MAX_LENGTH))}
          placeholder="Type your response..."
          rows={4}
          disabled={disabled}
          className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-lg focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
        />
        <p className="mt-1 text-right text-sm text-gray-500">
          {value.length}/{MAX_LENGTH}
        </p>
      </div>
      <div className="flex justify-center">
        <button
          type="submit"
          disabled={!value.trim() || disabled}
          className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-8 py-4 text-lg font-medium text-white shadow-lg transition hover:from-indigo-600 hover:to-violet-600 disabled:opacity-50 disabled:hover:from-indigo-500 disabled:hover:to-violet-500"
        >
          Submit
        </button>
      </div>
    </form>
  );
}
