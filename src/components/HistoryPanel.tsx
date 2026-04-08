"use client";

import { useState, useEffect } from "react";
import {
  HistoryEntry,
  getHistory,
  clearHistory,
  getPreviewText,
} from "@/lib/history";

interface HistoryPanelProps {
  onSelect: (entry: HistoryEntry) => void;
  refreshKey: number;
}

export default function HistoryPanel({ onSelect, refreshKey }: HistoryPanelProps) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setEntries(getHistory());
  }, [refreshKey]);

  function handleClearAll() {
    if (!window.confirm("히스토리를 모두 삭제할까요?")) return;
    clearHistory();
    setEntries([]);
  }

  function formatDate(iso: string): string {
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <svg
          className="w-4 h-4 text-indigo-500 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <h2 className="text-sm font-semibold text-gray-700 tracking-wide">히스토리</h2>
      </div>

      {entries.length === 0 ? (
        <p className="text-xs text-gray-400 py-2">아직 변환 히스토리가 없습니다.</p>
      ) : (
        <>
          <ul className="flex flex-col gap-1">
            {entries.map((entry) => (
              <li
                key={entry.id}
                onClick={() => onSelect(entry)}
                className="flex flex-col gap-0.5 px-3 py-2 rounded-md cursor-pointer border-l-2 border-transparent hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
              >
                <span className="text-xs text-gray-800 truncate leading-snug">
                  {getPreviewText(entry, 60)}
                </span>
                <span className="text-xs text-gray-400">{formatDate(entry.createdAt)}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={handleClearAll}
            className="mt-1 self-start text-xs text-gray-400 hover:text-red-500 transition-colors"
          >
            전체 삭제
          </button>
        </>
      )}
    </section>
  );
}
