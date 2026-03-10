"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const qrSize = 420;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-indigo-50 px-6">
      <div className="flex flex-col items-center gap-12 md:flex-row md:items-center md:gap-16">
        <div className="flex flex-col items-center text-center md:items-start md:text-left">
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

          <a
            href="https://www.yellkey.com/water"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 text-2xl font-medium text-indigo-600 hover:underline"
          >
            www.yellkey.com/water
          </a>

          <div className="mt-8 flex gap-6 text-sm">
            <Link href="/display" className="text-indigo-600 hover:underline">
              Display
            </Link>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-center rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <p className="mb-4 text-sm font-medium text-gray-600">
            Scan to join
          </p>
          {mounted ? (
            <QRCodeSVG value={window.location.origin} size={qrSize} level="M" includeMargin />
          ) : (
            <div className="animate-pulse rounded bg-gray-100" style={{ height: qrSize, width: qrSize }} aria-hidden />
          )}
        </div>
      </div>
    </div>
  );
}
