"use client";

interface ResponseCounterProps {
  count: number;
}

export function ResponseCounter({ count }: ResponseCounterProps) {
  return (
    <div className="rounded-full bg-gray-900/80 px-4 py-2 text-sm font-medium text-white backdrop-blur">
      {count} response{count !== 1 ? "s" : ""}
    </div>
  );
}
