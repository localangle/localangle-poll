"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";

export function QRCodePanel() {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => setMounted(true), []);

  const url = mounted
    ? (process.env.NEXT_PUBLIC_POLL_URL ?? `${window.location.origin}/poll`)
    : "";

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for older browsers
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-sm font-medium text-gray-700">Join the poll</h3>
      <div className="flex flex-col items-center gap-4">
        {mounted ? (
          <QRCodeSVG value={url} size={160} level="M" includeMargin />
        ) : (
          <div className="h-[160px] w-[160px] animate-pulse rounded bg-gray-100" aria-hidden />
        )}
        <button
          onClick={copyUrl}
          disabled={!mounted}
          className="rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
        >
          {copied ? "Copied!" : "Copy URL"}
        </button>
      </div>
    </div>
  );
}
