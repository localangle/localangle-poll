"use client";

import { useState, useCallback, useEffect, ReactNode } from "react";

const STORAGE_KEY = "poll_admin_pin";

export function getAdminHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const pin = sessionStorage.getItem(STORAGE_KEY);
  return pin ? { "X-Admin-Pin": pin } : {};
}

export function usePinGate() {
  const [isVerified, setIsVerified] = useState<boolean | null>(null);

  useEffect(() => {
    setIsVerified(!!sessionStorage.getItem(STORAGE_KEY));
  }, []);
  const [error, setError] = useState<string | null>(null);

  const verifyPin = useCallback(async (pin: string) => {
    setError(null);
    const res = await fetch("/api/admin/verify-pin", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Admin-Pin": pin },
      body: JSON.stringify({ pin }),
    });
    if (res.ok) {
      sessionStorage.setItem(STORAGE_KEY, pin);
      setIsVerified(true);
      return true;
    }
    setError("Invalid PIN");
    return false;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setIsVerified(false);
  }, []);

  return { isVerified, error, verifyPin, logout };
}

interface PinGateProps {
  children: ReactNode;
}

export function PinGate({ children }: PinGateProps) {
  const { isVerified, error, verifyPin } = usePinGate();
  const [pin, setPin] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyPin(pin);
  };

  if (isVerified === null) {
    return <div className="flex min-h-screen items-center justify-center bg-gray-50">Loading...</div>;
  }

  if (!isVerified) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <h1 className="mb-6 text-center text-xl font-semibold text-gray-900">Admin Access</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="Enter PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-lg tracking-widest focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              autoFocus
            />
            {error && <p className="text-center text-sm text-rose-500">{error}</p>}
            <button
              type="submit"
              className="w-full rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-3 font-medium text-white shadow-sm transition hover:from-indigo-600 hover:to-violet-600"
            >
              Enter
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
