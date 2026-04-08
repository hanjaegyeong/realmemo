"use client";

import { useState } from "react";

interface TableWidget {
  type: "table";
  title: string;
  data: { headers: string[]; rows: string[][] };
}

interface TimelineWidget {
  type: "timeline";
  title: string;
  data: { items: { date: string; event: string }[] };
}

interface ChecklistWidget {
  type: "checklist";
  title: string;
  data: { items: string[] };
}

interface SummaryCardWidget {
  type: "summary_card";
  title: string;
  data: { items: { label: string; value: string }[] };
}

type Widget = TableWidget | TimelineWidget | ChecklistWidget | SummaryCardWidget;

function TableView({ widget }: { widget: TableWidget }) {
  const { headers = [], rows = [] } = widget.data || {};
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  const handleSort = (col: number) => {
    if (sortCol === col) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(col);
      setSortAsc(true);
    }
  };

  const sortedRows = sortCol !== null
    ? [...rows].sort((a, b) => {
        const valA = a[sortCol] || "";
        const valB = b[sortCol] || "";
        return sortAsc ? valA.localeCompare(valB, "ko") : valB.localeCompare(valA, "ko");
      })
    : rows;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-indigo-200 bg-indigo-50">
            {headers.map((h, i) => (
              <th
                key={i}
                onClick={() => handleSort(i)}
                className="px-4 py-3 text-left font-semibold text-indigo-900 cursor-pointer hover:bg-indigo-100 transition-colors select-none"
              >
                {h}
                {sortCol === i && (
                  <span className="ml-1 text-xs">{sortAsc ? "▲" : "▼"}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row, i) => (
            <tr
              key={i}
              className="border-b border-gray-100 hover:bg-indigo-50/50 transition-colors"
            >
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-black">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TimelineView({ widget }: { widget: TimelineWidget }) {
  const items = widget.data?.items || [];
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <div className="relative pl-6">
      <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-indigo-200" />
      {items.map((item, i) => (
        <div
          key={i}
          onClick={() => setActiveIndex(activeIndex === i ? null : i)}
          className="relative mb-4 last:mb-0 cursor-pointer group"
        >
          <div
            className={`absolute -left-4 top-1.5 h-3 w-3 rounded-full border-2 transition-all duration-300 ${
              activeIndex === i
                ? "border-indigo-600 bg-indigo-600 scale-125"
                : "border-indigo-400 bg-white group-hover:border-indigo-600"
            }`}
          />
          <div
            className={`ml-4 rounded-lg p-3 transition-all duration-300 ${
              activeIndex === i
                ? "bg-indigo-50 border border-indigo-200 shadow-sm"
                : "hover:bg-gray-50"
            }`}
          >
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              {item.date}
            </span>
            <p className="mt-1 text-sm text-black">{item.event}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ChecklistView({ widget }: { widget: ChecklistWidget }) {
  const items = widget.data?.items || [];
  const [checked, setChecked] = useState<boolean[]>(new Array(items.length).fill(false));

  const toggle = (index: number) => {
    setChecked((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const doneCount = checked.filter(Boolean).length;

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${items.length > 0 ? (doneCount / items.length) * 100 : 0}%` }}
          />
        </div>
        <span className="text-xs font-medium text-gray-500">
          {doneCount}/{items.length}
        </span>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li
            key={i}
            onClick={() => toggle(i)}
            className="flex items-start gap-3 cursor-pointer group rounded-lg px-2 py-1.5 hover:bg-gray-50 transition-colors"
          >
            <span
              className={`mt-0.5 h-5 w-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                checked[i]
                  ? "border-indigo-500 bg-indigo-500"
                  : "border-gray-300 group-hover:border-indigo-400"
              }`}
            >
              {checked[i] && (
                <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </span>
            <span
              className={`text-sm transition-all duration-200 ${
                checked[i] ? "line-through text-gray-400" : "text-black"
              }`}
            >
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SummaryCardView({ widget }: { widget: SummaryCardWidget }) {
  const items = widget.data?.items || [];
  const [flipped, setFlipped] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item, i) => (
        <div
          key={i}
          onClick={() => setFlipped(flipped === i ? null : i)}
          className={`rounded-lg p-4 border cursor-pointer transition-all duration-300 ${
            flipped === i
              ? "bg-indigo-600 border-indigo-600 shadow-md scale-[1.02]"
              : "bg-gradient-to-br from-indigo-50 to-white border-indigo-100 hover:shadow-sm hover:border-indigo-200"
          }`}
        >
          <p
            className={`text-xs font-medium transition-colors duration-300 ${
              flipped === i ? "text-indigo-200" : "text-indigo-500"
            }`}
          >
            {item.label}
          </p>
          <p
            className={`mt-1 text-lg font-bold transition-colors duration-300 ${
              flipped === i ? "text-white" : "text-black"
            }`}
          >
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function WidgetRenderer({ widgets }: { widgets: Widget[] }) {
  if (!widgets || widgets.length === 0) return null;

  return (
    <div className="space-y-4">
      {widgets.map((widget, i) => (
        <div key={i} className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
            <h3 className="text-sm font-semibold text-black">{widget.title}</h3>
          </div>
          <div className="p-5">
            {widget.type === "table" && <TableView widget={widget as TableWidget} />}
            {widget.type === "timeline" && <TimelineView widget={widget as TimelineWidget} />}
            {widget.type === "checklist" && <ChecklistView widget={widget as ChecklistWidget} />}
            {widget.type === "summary_card" && <SummaryCardView widget={widget as SummaryCardWidget} />}
          </div>
        </div>
      ))}
    </div>
  );
}
