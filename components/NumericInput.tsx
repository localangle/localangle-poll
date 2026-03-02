"use client";

import { useState, useRef, useEffect, useCallback } from "react";

const MIN = 0;
const MAX = 10;
const THUMB_SIZE = 40;

interface NumericInputProps {
  onSubmit: (value: number) => void;
  disabled?: boolean;
}

export function NumericInput({ onSubmit, disabled }: NumericInputProps) {
  const [value, setValue] = useState(5);
  const [trackWidth, setTrackWidth] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const update = () => setTrackWidth(el.offsetWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const pct = (value - MIN) / (MAX - MIN);
  const thumbLeft = trackWidth > 0
    ? Math.max(0, Math.min(trackWidth - THUMB_SIZE, pct * (trackWidth - THUMB_SIZE)))
    : 0;

  const valueFromClientX = useCallback((clientX: number) => {
    const el = trackRef.current;
    if (!el) return MIN;
    const rect = el.getBoundingClientRect();
    const x = clientX - rect.left;
    const p = Math.max(0, Math.min(1, x / rect.width));
    return Math.round(MIN + p * (MAX - MIN));
  }, []);

  const handleTrackClick = (e: React.MouseEvent) => {
    if (disabled) return;
    if ((e.target as HTMLElement).closest("[data-thumb]")) return;
    setValue(valueFromClientX(e.clientX));
  };

  const handleThumbMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    const onMove = (ev: MouseEvent) => setValue(valueFromClientX(ev.clientX));
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const handleThumbTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    const onTouchMove = (ev: TouchEvent) => {
      const t = ev.touches[0];
      if (t) setValue(valueFromClientX(t.clientX));
    };
    const onTouchEnd = () => {
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      setValue((v) => Math.min(MAX, v + 1));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      setValue((v) => Math.max(MIN, v - 1));
    } else if (e.key === "Home") {
      e.preventDefault();
      setValue(MIN);
    } else if (e.key === "End") {
      e.preventDefault();
      setValue(MAX);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(value);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-4">
        <div className="text-center">
          <span className="text-5xl font-bold text-indigo-600">{value}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="shrink-0 text-xl font-medium text-gray-600">1</span>
          <div className="flex-1 px-2">
            <div
              ref={trackRef}
              role="slider"
              aria-valuemin={MIN}
              aria-valuemax={MAX}
              aria-valuenow={value}
              aria-disabled={disabled}
              tabIndex={disabled ? undefined : 0}
              onKeyDown={handleKeyDown}
              className="relative h-6 cursor-pointer select-none"
              onClick={handleTrackClick}
            >
              <div className="absolute inset-0 rounded-full bg-gray-200" />
              <div
                className="absolute left-0 top-0 h-full rounded-l-full bg-indigo-500"
                style={{ width: thumbLeft + THUMB_SIZE / 2 }}
              />
              <div
                data-thumb
                className="absolute top-1/2 z-10 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 cursor-grab items-center justify-center rounded-full border-2 border-indigo-500 bg-white shadow-md active:cursor-grabbing"
                style={{ left: thumbLeft + THUMB_SIZE / 2 }}
                onMouseDown={handleThumbMouseDown}
                onTouchStart={handleThumbTouchStart}
              />
            </div>
          </div>
          <span className="shrink-0 text-xl font-medium text-gray-600">10</span>
        </div>
      </div>
      <div className="flex justify-center">
        <button
          type="submit"
          disabled={disabled}
          className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-8 py-4 text-lg font-medium text-white shadow-lg transition hover:from-indigo-600 hover:to-violet-600 disabled:opacity-50 disabled:hover:from-indigo-500 disabled:hover:to-violet-500"
        >
          Submit
        </button>
      </div>
    </form>
  );
}
