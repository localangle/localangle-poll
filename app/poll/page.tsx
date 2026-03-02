"use client";

import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { WaitingScreen } from "@/components/WaitingScreen";
import { NumericInput } from "@/components/NumericInput";
import { MultipleChoiceInput } from "@/components/MultipleChoiceInput";
import { FreeTextInput } from "@/components/FreeTextInput";
import Link from "next/link";

const RESPONDENT_ID_KEY = "poll_respondent_id";
const ANSWERED_KEY = "poll_answered";

function getRespondentId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(RESPONDENT_ID_KEY);
  if (!id) {
    id = uuidv4();
    localStorage.setItem(RESPONDENT_ID_KEY, id);
  }
  return id;
}

function getAnsweredSet(): Set<number> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(ANSWERED_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function addAnswered(qid: number) {
  const set = getAnsweredSet();
  set.add(qid);
  localStorage.setItem(ANSWERED_KEY, JSON.stringify(Array.from(set)));
}

interface Question {
  id: number;
  question_text: string;
  question_type: string;
  options: string[] | null;
}

export default function PollPage() {
  const [question, setQuestion] = useState<Question | null | undefined>(undefined);
  const [answered, setAnswered] = useState<Set<number>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [thanks, setThanks] = useState(false);

  const fetchCurrent = useCallback(async () => {
    const res = await fetch("/api/current");
    const data = await res.json();
    setQuestion(data.question);
  }, []);

  useEffect(() => {
    setAnswered(getAnsweredSet());
    fetchCurrent();
    const interval = setInterval(fetchCurrent, 3000);
    return () => clearInterval(interval);
  }, [fetchCurrent]);

  const submitResponse = async (responseValue: string | number | string[]) => {
    if (!question || submitting) return;
    setSubmitting(true);
    const respondentId = getRespondentId();
    const res = await fetch("/api/respond", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question_id: question.id,
        response_value: responseValue,
        respondent_id: respondentId,
      }),
    });
    setSubmitting(false);
    if (res.ok) {
      addAnswered(question.id);
      setAnswered(getAnsweredSet());
      setThanks(true);
      setTimeout(() => setThanks(false), 2000);
    } else if (res.status === 409) {
      addAnswered(question.id);
      setAnswered(getAnsweredSet());
    }
  };

  if (question === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (thanks) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6">
        <div className="rounded-full bg-green-100 p-6">
          <span className="text-5xl">✓</span>
        </div>
        <p className="mt-6 text-2xl font-semibold text-gray-900">Thanks!</p>
        <p className="mt-2 text-gray-500">Your response has been recorded</p>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="border-b border-gray-200 bg-white px-4 py-3">
          <Link href="/" className="text-lg font-semibold text-gray-900">
            LocalAngle Poll
          </Link>
        </header>
        <WaitingScreen />
      </div>
    );
  }

  const alreadyAnswered = answered.has(question.id);
  if (alreadyAnswered) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="border-b border-gray-200 bg-white px-4 py-3">
          <Link href="/" className="text-lg font-semibold text-gray-900">
            LocalAngle Poll
          </Link>
        </header>
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-6">
          <div className="rounded-full bg-indigo-100 p-6">
            <span className="text-5xl text-indigo-600">✓</span>
          </div>
          <p className="mt-6 text-xl font-medium text-gray-900">Response recorded</p>
          <p className="mt-2 text-center text-gray-500">
            Waiting for the next question...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-4 py-3">
        <Link href="/" className="text-lg font-semibold text-gray-900">
          LocalAngle Poll
        </Link>
      </header>
      <main className="mx-auto max-w-lg px-4 py-8">
        <h2 className="mb-8 text-2xl font-semibold text-gray-900">
          {question.question_text}
        </h2>
        {question.question_type === "numeric" && (
          <NumericInput
            onSubmit={(n) => submitResponse(n)}
            disabled={submitting}
          />
        )}
        {question.question_type === "multiple_choice" && (
          <MultipleChoiceInput
            options={question.options ?? []}
            onSubmit={(opts) => submitResponse(opts)}
            disabled={submitting}
          />
        )}
        {question.question_type === "free_text" && (
          <FreeTextInput
            onSubmit={(t) => submitResponse(t)}
            disabled={submitting}
          />
        )}
      </main>
    </div>
  );
}
