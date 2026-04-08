"use client";

import { useState } from "react";
import ResultView from "@/components/ResultView";

export default function Home() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<null | {
    markdown: string;
    diagrams?: string[];
    widgets?: Array<{
      type: "table" | "timeline" | "checklist" | "summary_card";
      title: string;
      data: Record<string, unknown>;
    }>;
  }>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTransform = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/transform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "변환에 실패했습니다.");
        return;
      }

      setResult(data);
    } catch {
      setError("서버와 연결할 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            <span className="text-indigo-600">Real</span>Memo
          </h1>
          <span className="text-xs text-gray-400">
            텍스트를 진짜 메모로
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        {/* Input Section */}
        <section className="mb-10">
          <label
            htmlFor="input-text"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            텍스트 입력
          </label>
          <textarea
            id="input-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="정리하고 싶은 텍스트를 자유롭게 입력하세요...&#10;&#10;예: 회의록, 아이디어, 메모, 강의 노트, 기획안 등"
            className="w-full min-h-[200px] rounded-xl border border-gray-300 bg-white px-5 py-4 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none resize-y text-sm leading-relaxed transition-all"
          />
          <div className="mt-4 flex items-center gap-4">
            <button
              onClick={handleTransform}
              disabled={loading || !text.trim()}
              className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  변환 중...
                </span>
              ) : (
                "변환하기"
              )}
            </button>
            {text.trim() && (
              <span className="text-xs text-gray-400">
                {text.length.toLocaleString()}자
              </span>
            )}
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="mb-8 rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Result Section */}
        {result && (
          <section className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <ResultView result={result} />
          </section>
        )}
      </main>
    </div>
  );
}
