"use client";

import { useState, useEffect, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Histogram } from "@/components/Histogram";
import { ResultsBarChart } from "@/components/ResultsBarChart";
import { TextFeed } from "@/components/TextFeed";
import { ResponseCounter } from "@/components/ResponseCounter";

interface Question {
  id: number;
  question_text: string;
  question_type: string;
  options: string[] | null;
}

interface Response {
  id: number;
  response_value: string;
  created_at: string;
}

function parseResponseValue(
  raw: string,
  questionType: string
): string | number | string[] {
  if (questionType === "numeric") {
    const n = parseInt(raw, 10);
    return isNaN(n) ? 0 : n;
  }
  if (questionType === "multiple_choice") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [raw];
    } catch {
      return [raw];
    }
  }
  return raw;
}

function aggregateNumeric(responses: Response[]): { value: number; count: number }[] {
  const counts: Record<number, number> = {};
  for (let i = 1; i <= 10; i++) counts[i] = 0;
  for (const r of responses) {
    const v = parseResponseValue(r.response_value, "numeric") as number;
    if (v >= 1 && v <= 10) counts[v] = (counts[v] ?? 0) + 1;
  }
  return Object.entries(counts).map(([value, count]) => ({
    value: parseInt(value, 10),
    count,
  }));
}

function aggregateMultipleChoice(
  responses: Response[],
  options: string[]
): { option: string; count: number; percentage: number }[] {
  const counts: Record<string, number> = {};
  for (const opt of options) counts[opt] = 0;
  for (const r of responses) {
    const arr = parseResponseValue(r.response_value, "multiple_choice") as string[];
    for (const opt of arr) {
      if (counts[opt] !== undefined) counts[opt]++;
    }
  }
  const total = responses.length;
  return options.map((opt) => ({
    option: opt,
    count: counts[opt] ?? 0,
    percentage: total > 0 ? Math.round(((counts[opt] ?? 0) / total) * 100) : 0,
  }));
}

function DisplayStandby() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-indigo-50 px-8">
      <h1 className="text-5xl font-bold text-gray-900">LocalAngle Poll</h1>
      <p className="mt-4 text-2xl text-gray-600">Waiting for the next question</p>
      <div className="mt-12 rounded-2xl border border-gray-200 bg-white p-8">
        {mounted ? (
          <QRCodeSVG value={window.location.origin} size={200} level="M" />
        ) : (
          <div className="h-[200px] w-[200px] animate-pulse rounded bg-gray-100" aria-hidden />
        )}
      </div>
    </div>
  );
}

export default function DisplayPage() {
  const [question, setQuestion] = useState<Question | null | undefined>(undefined);
  const [responses, setResponses] = useState<Response[]>([]);

  useEffect(() => {
    const fetchResults = async () => {
      const res = await fetch("/api/results");
      const data = await res.json();
      setQuestion(data.question);
      setResponses(data.responses ?? []);
    };
    fetchResults();
    const interval = setInterval(fetchResults, 1500);
    return () => clearInterval(interval);
  }, []);

  const histogramData = useMemo(
    () => (question?.question_type === "numeric" ? aggregateNumeric(responses) : []),
    [question?.question_type, responses]
  );

  const barChartData = useMemo(
    () =>
      question?.question_type === "multiple_choice" && question?.options
        ? aggregateMultipleChoice(responses, question.options)
        : [],
    [question?.question_type, question?.options, responses]
  );

  if (question === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-5xl">Loading...</p>
      </div>
    );
  }

  if (!question) {
    return (
      <DisplayStandby />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-8 py-12">
        <h2 className="mb-2 text-center text-4xl font-bold text-gray-900 md:text-5xl">
          {question.question_text}
        </h2>
        <div className="mb-2 h-1 w-24 mx-auto rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" />

        <div className="mt-12">
          {question.question_type === "numeric" && (
            <Histogram data={histogramData} />
          )}
          {question.question_type === "multiple_choice" && (
            <ResultsBarChart options={question.options ?? []} data={barChartData} />
          )}
          {question.question_type === "free_text" && (
            <TextFeed responses={responses} />
          )}
        </div>

        <div className="fixed bottom-8 right-8">
          <ResponseCounter count={responses.length} />
        </div>
      </div>
    </div>
  );
}
