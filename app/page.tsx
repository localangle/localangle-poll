"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-indigo-50 px-6">
      <h1 className="text-4xl font-bold text-gray-900 md:text-5xl">
        Navigating the Hype Cycle
      </h1>
      <p className="mt-4 text-lg text-gray-600">
        An NPA/RJI discussion. Scan the QR code to begin.
      </p>

      <Link
        href="/poll"
        className="mt-10 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-12 py-5 text-xl font-semibold text-white shadow-lg transition hover:from-indigo-600 hover:to-violet-600"
      >
        Join the Poll
      </Link>

      <div className="mt-16 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <p className="mb-4 text-center text-sm font-medium text-gray-600">
          Scan to join
        </p>
        {mounted ? (
          <QRCodeSVG value={window.location.origin} size={200} level="M" includeMargin />
        ) : (
          <div className="h-[200px] w-[200px] animate-pulse rounded bg-gray-100" aria-hidden />
        )}
      </div>

      <div className="mt-12 flex gap-6 text-sm">
        <Link href="/display" className="text-indigo-600 hover:underline">
          Display
        </Link>
      </div>
    </div>
  );
}
