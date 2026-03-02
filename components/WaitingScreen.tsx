"use client";

export function WaitingScreen() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6">
      <div className="animate-pulse rounded-full bg-gradient-to-r from-indigo-400 to-violet-400 p-4">
        <div className="h-12 w-12 rounded-full bg-white/30" />
      </div>
      <p className="mt-6 text-center text-xl font-medium text-gray-700">
        Waiting for the next question...
      </p>
      <p className="mt-2 text-center text-sm text-gray-500">
        The presenter will activate a question soon
      </p>
    </div>
  );
}
