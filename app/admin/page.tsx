"use client";

import { useState, useEffect, useCallback } from "react";
import { PinGate, getAdminHeaders } from "@/components/PinGate";
import { QRCodePanel } from "@/components/QRCodePanel";
import { QuestionForm, QuestionFormData, QuestionType } from "@/components/QuestionForm";
import Link from "next/link";

interface Question {
  id: number;
  question_text: string;
  question_type: string;
  options: string[] | null;
  display_order: number;
  is_active: boolean;
  response_count: number;
}

function AdminContent() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchQuestions = useCallback(async () => {
    const res = await fetch("/api/admin/questions", { headers: getAdminHeaders() });
    if (res.ok) {
      const data = await res.json();
      setQuestions(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const activate = async (id: number) => {
    const res = await fetch(`/api/admin/activate/${id}`, {
      method: "POST",
      headers: getAdminHeaders(),
    });
    if (res.ok) fetchQuestions();
  };

  const deactivate = async () => {
    const res = await fetch("/api/admin/deactivate", {
      method: "POST",
      headers: getAdminHeaders(),
    });
    if (res.ok) fetchQuestions();
  };

  const moveQuestion = async (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= questions.length) return;
    const reordered = [...questions];
    [reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]];
    const order = reordered.map((q) => q.id);
    const res = await fetch("/api/admin/reorder", {
      method: "POST",
      headers: { ...getAdminHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ order }),
    });
    if (res.ok) setQuestions(reordered);
  };

  const createQuestion = async (data: QuestionFormData) => {
    const res = await fetch("/api/admin/questions", {
      method: "POST",
      headers: { ...getAdminHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setFormOpen(false);
      fetchQuestions();
    }
  };

  const updateQuestion = async (data: QuestionFormData) => {
    if (!editingId) return;
    const res = await fetch(`/api/admin/questions/${editingId}`, {
      method: "PUT",
      headers: { ...getAdminHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setFormOpen(false);
      setEditingId(null);
      fetchQuestions();
    }
  };

  const deleteQuestion = async (id: number) => {
    if (!confirm("Delete this question?")) return;
    const res = await fetch(`/api/admin/questions/${id}`, {
      method: "DELETE",
      headers: getAdminHeaders(),
    });
    if (res.ok) fetchQuestions();
  };

  const openEdit = (q: Question) => {
    setEditingId(q.id);
    setFormOpen(true);
  };

  const typeBadge = (t: string) => {
    const colors: Record<string, string> = {
      numeric: "bg-teal-100 text-teal-800",
      multiple_choice: "bg-amber-100 text-amber-800",
      free_text: "bg-violet-100 text-violet-800",
    };
    return (
      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors[t] ?? "bg-gray-100 text-gray-800"}`}>
        {t.replace("_", " ")}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-lg font-semibold text-gray-900">
              Navigating the Hype Cycle
            </Link>
            <span className="text-sm text-gray-500">Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/display"
              target="_blank"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Open Display
            </Link>
            <button
              onClick={deactivate}
              className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100"
            >
              Deactivate / Waiting
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Questions</h2>
              <button
                onClick={() => {
                  setEditingId(null);
                  setFormOpen(true);
                }}
                className="rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:from-indigo-600 hover:to-violet-600"
              >
                + Add question
              </button>
            </div>

            {loading ? (
              <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
                Loading...
              </div>
            ) : questions.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
                No questions yet. Add one to get started.
              </div>
            ) : (
              <div className="space-y-3">
                {questions.map((q, i) => (
                  <div
                    key={q.id}
                    className={`flex items-center gap-4 rounded-xl border bg-white p-4 shadow-sm transition ${
                      q.is_active
                        ? "border-indigo-300 bg-indigo-50/50"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex flex-col gap-0">
                      <button
                        onClick={() => moveQuestion(i, "up")}
                        disabled={i === 0}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30"
                        aria-label="Move up"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => moveQuestion(i, "down")}
                        disabled={i === questions.length - 1}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30"
                        aria-label="Move down"
                      >
                        ▼
                      </button>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-gray-900">{q.question_text}</p>
                      <div className="mt-1 flex items-center gap-2">
                        {typeBadge(q.question_type)}
                        <span className="text-sm text-gray-500">
                          {q.response_count} responses
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => activate(q.id)}
                        className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                          q.is_active
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {q.is_active ? "Active" : "Activate"}
                      </button>
                      <button
                        onClick={() => openEdit(q)}
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                        aria-label="Edit"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => deleteQuestion(q.id)}
                        className="rounded-lg p-2 text-rose-500 hover:bg-rose-50"
                        aria-label="Delete"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <QRCodePanel />
          </div>
        </div>
      </main>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-6 text-lg font-semibold text-gray-900">
              {editingId ? "Edit question" : "New question"}
            </h3>
            <QuestionForm
              initial={
                editingId
                  ? (() => {
                      const q = questions.find((q) => q.id === editingId);
                      return q
                        ? {
                            id: q.id,
                            question_text: q.question_text,
                            question_type: q.question_type as QuestionType,
                            options: q.options ?? [],
                          }
                        : undefined;
                    })()
                  : undefined
              }
              onSubmit={editingId ? updateQuestion : createQuestion}
              onCancel={() => {
                setFormOpen(false);
                setEditingId(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  return (
    <PinGate>
      <AdminContent />
    </PinGate>
  );
}
