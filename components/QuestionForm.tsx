"use client";

import { useState, useEffect } from "react";

export type QuestionType = "numeric" | "multiple_choice" | "free_text";

export interface QuestionFormData {
  question_text: string;
  question_type: QuestionType;
  options: string[];
}

interface QuestionFormProps {
  initial?: Partial<QuestionFormData> & { id?: number };
  onSubmit: (data: QuestionFormData) => void;
  onCancel: () => void;
}

export function QuestionForm({ initial, onSubmit, onCancel }: QuestionFormProps) {
  const [questionText, setQuestionText] = useState(initial?.question_text ?? "");
  const [questionType, setQuestionType] = useState<QuestionType>(
    initial?.question_type ?? "numeric"
  );
  const [options, setOptions] = useState<string[]>(
    initial?.options?.length ? initial.options : ["", ""]
  );

  useEffect(() => {
    if (initial?.options?.length) {
      setOptions(initial.options.length >= 2 ? initial.options : ["", ""]);
    }
  }, [initial?.options]);

  const addOption = () => setOptions((o) => [...o, ""]);
  const removeOption = (i: number) => setOptions((o) => o.filter((_, j) => j !== i));
  const updateOption = (i: number, v: string) =>
    setOptions((o) => o.map((opt, j) => (j === i ? v : opt)));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;
    if (questionType === "multiple_choice") {
      const opts = options.filter((o) => o.trim());
      if (opts.length < 2) return;
      onSubmit({ question_text: questionText.trim(), question_type: questionType, options: opts });
    } else {
      onSubmit({
        question_text: questionText.trim(),
        question_type: questionType,
        options: [],
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Question</label>
        <textarea
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="Enter your question..."
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Type</label>
        <select
          value={questionType}
          onChange={(e) => setQuestionType(e.target.value as QuestionType)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="numeric">Numeric (1-10)</option>
          <option value="multiple_choice">Multiple choice</option>
          <option value="free_text">Free text</option>
        </select>
      </div>

      {questionType === "multiple_choice" && (
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Options (min 2)</label>
          <div className="space-y-2">
            {options.map((opt, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => updateOption(i, e.target.value)}
                  placeholder={`Option ${i + 1}`}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <button
                  type="button"
                  onClick={() => removeOption(i)}
                  disabled={options.length <= 2}
                  className="rounded-lg px-3 py-2 text-rose-500 hover:bg-rose-50 disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addOption}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              + Add option
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2 font-medium text-white shadow-sm hover:from-indigo-600 hover:to-violet-600"
        >
          {initial?.id ? "Save" : "Create"}
        </button>
      </div>
    </form>
  );
}
