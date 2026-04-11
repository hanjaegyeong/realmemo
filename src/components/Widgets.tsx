"use client";

import { useState, useEffect } from "react";

// ─── Interfaces ───────────────────────────────────────────────────────────────

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

interface ChartWidget {
  type: "chart";
  title: string;
  data: {
    chart_type: "bar" | "pie" | "line";
    labels: string[];
    datasets: { name: string; values: number[] }[];
  };
}

interface MindmapNode {
  label: string;
  children?: MindmapNode[];
}

interface MindmapWidget {
  type: "mindmap";
  title: string;
  data: { root: string; children: MindmapNode[] };
}

interface RadialMapWidget {
  type: "radial_map";
  title: string;
  data: { root: string; children: MindmapNode[] };
}

interface KanbanWidget {
  type: "kanban";
  title: string;
  data: { columns: { title: string; cards: string[] }[] };
}

interface ProgressWidget {
  type: "progress";
  title: string;
  data: { items: { label: string; value: number; max?: number }[] };
}

interface QuoteWidget {
  type: "quote";
  title: string;
  data: { text: string; author?: string; style?: "info" | "warning" | "success" };
}

interface ProsConsWidget {
  type: "pros_cons";
  title: string;
  data: { pros: string[]; cons: string[] };
}

interface AccordionWidget {
  type: "accordion";
  title: string;
  data: { items: { title: string; content: string }[] };
}

interface LinkListWidget {
  type: "link_list";
  title: string;
  data: { items: { title: string; url: string; description?: string }[] };
}

interface GalleryWidget {
  type: "gallery";
  title: string;
  data: { items: { title: string; description: string; tag?: string }[] };
}

interface RatingWidget {
  type: "rating";
  title: string;
  data: { items: { label: string; score: number; max?: number }[] };
}

interface ProcessWidget {
  type: "process";
  title: string;
  data: { steps: { label: string; description?: string }[] };
}

interface MetricWidget {
  type: "metric";
  title: string;
  data: { items: { label: string; value: string; delta?: string; trend?: "up" | "down" | "neutral" }[] };
}

interface SwotWidget {
  type: "swot";
  title: string;
  data: { strengths: string[]; weaknesses: string[]; opportunities: string[]; threats: string[] };
}

interface ComparisonWidget {
  type: "comparison";
  title: string;
  data: { columns: string[]; features: { name: string; values: (boolean | string)[] }[] };
}

interface PollWidget {
  type: "poll";
  title: string;
  data: { items: { label: string; votes: number }[] };
}

type Widget =
  | TableWidget
  | TimelineWidget
  | ChecklistWidget
  | SummaryCardWidget
  | ChartWidget
  | MindmapWidget
  | RadialMapWidget
  | KanbanWidget
  | ProgressWidget
  | QuoteWidget
  | ProsConsWidget
  | AccordionWidget
  | LinkListWidget
  | GalleryWidget
  | RatingWidget
  | ProcessWidget
  | MetricWidget
  | SwotWidget
  | ComparisonWidget
  | PollWidget;

// ─── Table ────────────────────────────────────────────────────────────────────

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

  const sortedRows =
    sortCol !== null
      ? [...rows].sort((a, b) => {
          const valA = a[sortCol] || "";
          const valB = b[sortCol] || "";
          return sortAsc
            ? valA.localeCompare(valB, "ko")
            : valB.localeCompare(valA, "ko");
        })
      : rows;

  return (
    <div className="overflow-x-auto -mx-6 -mb-6">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            {headers.map((h, i) => (
              <th
                key={i}
                onClick={() => handleSort(i)}
                className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-indigo-600 transition-colors select-none group"
              >
                <span className="inline-flex items-center gap-1.5">
                  {h}
                  <span className="inline-flex flex-col leading-none">
                    <svg className={`w-3 h-3 ${sortCol === i && sortAsc ? "text-indigo-600" : "text-gray-300 group-hover:text-gray-400"}`} viewBox="0 0 12 12" fill="currentColor">
                      <path d="M6 2l4 4H2z" />
                    </svg>
                    <svg className={`w-3 h-3 -mt-1 ${sortCol === i && !sortAsc ? "text-indigo-600" : "text-gray-300 group-hover:text-gray-400"}`} viewBox="0 0 12 12" fill="currentColor">
                      <path d="M6 10l4-4H2z" />
                    </svg>
                  </span>
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sortedRows.map((row, i) => (
            <tr
              key={i}
              className={`hover:bg-indigo-50/60 transition-colors duration-150 ${
                i % 2 === 1 ? "bg-gray-50/50" : "bg-white"
              }`}
            >
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={`px-5 py-3.5 text-gray-700 ${
                    j === 0 ? "font-medium text-gray-900" : ""
                  }`}
                >
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

// ─── Timeline ─────────────────────────────────────────────────────────────────

function TimelineView({ widget }: { widget: TimelineWidget }) {
  const items = widget.data?.items || [];
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <div className="space-y-0">
      {items.map((item, i) => (
        <div key={i} className="flex gap-4">
          <div className="flex flex-col items-center flex-shrink-0 pt-1">
            <div
              onClick={() => setActiveIndex(activeIndex === i ? null : i)}
              className={`h-3.5 w-3.5 rounded-full border-2 flex-shrink-0 cursor-pointer transition-all duration-300 ${
                activeIndex === i
                  ? "border-indigo-600 bg-indigo-600 shadow-[0_0_0_3px_rgba(99,102,241,0.18)]"
                  : "border-indigo-300 bg-white hover:border-indigo-500 hover:scale-110"
              }`}
            />
            {i < items.length - 1 && (
              <div className="w-0.5 flex-1 mt-1.5 bg-gradient-to-b from-indigo-200 to-indigo-100 min-h-[28px]" />
            )}
          </div>
          <div
            className="flex-1 pb-4 last:pb-0 cursor-pointer"
            onClick={() => setActiveIndex(activeIndex === i ? null : i)}
          >
            <div className={`rounded-xl px-4 py-3 transition-all duration-200 ${
              activeIndex === i
                ? "bg-indigo-50/80 border border-indigo-200 shadow-sm"
                : "hover:bg-gray-50/60"
            }`}>
              <span className="inline-block text-xs font-semibold text-indigo-600 bg-indigo-100/80 px-2.5 py-0.5 rounded-full">
                {item.date}
              </span>
              <p className={`mt-1.5 text-sm leading-relaxed ${
                activeIndex === i ? "text-gray-900" : "text-gray-600"
              }`}>{item.event}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Checklist ────────────────────────────────────────────────────────────────

function ChecklistView({ widget }: { widget: ChecklistWidget }) {
  const items = widget.data?.items || [];
  const [checked, setChecked] = useState<boolean[]>(
    new Array(items.length).fill(false)
  );

  const toggle = (index: number) => {
    setChecked((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const doneCount = checked.filter(Boolean).length;
  const pct = items.length > 0 ? (doneCount / items.length) * 100 : 0;

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${pct}%`,
              background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
            }}
          />
        </div>
        <span className="text-xs font-semibold text-gray-500 tabular-nums">
          {doneCount}/{items.length}
        </span>
      </div>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li
            key={i}
            onClick={() => toggle(i)}
            className="flex items-start gap-3 cursor-pointer group rounded-lg px-3 py-2.5 hover:bg-gray-50 transition-colors duration-150"
          >
            <span
              className={`mt-0.5 h-5 w-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                checked[i]
                  ? "border-indigo-500 bg-indigo-500 scale-105"
                  : "border-gray-300 group-hover:border-indigo-400"
              }`}
              style={{ transform: checked[i] ? "scale(1.05)" : "scale(1)" }}
            >
              {checked[i] && (
                <svg
                  className="h-3 w-3 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </span>
            <span
              className={`text-sm transition-all duration-300 ${
                checked[i] ? "line-through text-gray-400 decoration-gray-300" : "text-gray-700"
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

// ─── Summary Card ─────────────────────────────────────────────────────────────

const SUMMARY_GRADIENTS = [
  "from-indigo-50 to-blue-50",
  "from-violet-50 to-indigo-50",
  "from-blue-50 to-cyan-50",
  "from-teal-50 to-emerald-50",
  "from-amber-50 to-orange-50",
  "from-rose-50 to-pink-50",
];

function SummaryCardView({ widget }: { widget: SummaryCardWidget }) {
  const items = widget.data?.items || [];
  const [flipped, setFlipped] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {items.map((item, i) => (
        <div
          key={i}
          onClick={() => setFlipped(flipped === i ? null : i)}
          className={`rounded-xl p-5 cursor-pointer transition-all duration-300 ${
            flipped === i
              ? "bg-indigo-600 shadow-lg shadow-indigo-200 scale-[1.03]"
              : `bg-gradient-to-br ${SUMMARY_GRADIENTS[i % SUMMARY_GRADIENTS.length]} hover:shadow-md hover:-translate-y-0.5`
          }`}
        >
          <p
            className={`text-xs font-medium uppercase tracking-wide transition-colors duration-300 ${
              flipped === i ? "text-indigo-200" : "text-gray-500"
            }`}
          >
            {item.label}
          </p>
          <p
            className={`mt-2 text-xl font-bold transition-colors duration-300 ${
              flipped === i ? "text-white" : "text-gray-900"
            }`}
          >
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}

// ─── Chart ────────────────────────────────────────────────────────────────────

const CHART_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#3b82f6",
  "#14b8a6",
  "#f59e0b",
  "#ef4444",
];

function ChartView({ widget }: { widget: ChartWidget }) {
  const { chart_type = "bar", labels = [], datasets = [] } = widget.data || {};
  const [hoveredIndex, setHoveredIndex] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  if (chart_type === "bar") {
    const allValues = datasets.flatMap((d) => d.values || []);
    const maxVal = Math.max(...allValues, 1);
    const barH = 180;
    const singleBarW = datasets.length === 1 ? 44 : datasets.length === 2 ? 28 : 20;

    return (
      <div className="space-y-4">
        <div className="flex items-end gap-3 px-2" style={{ height: barH + 56 }}>
          {labels.map((label, li) => (
            <div key={li} className="flex-1 flex flex-col items-center min-w-0">
              <div className="flex items-end gap-1 justify-center">
                {datasets.map((ds, di) => {
                  const val = ds.values?.[li] ?? 0;
                  const pct = (val / maxVal) * 100;
                  const hKey = `${li}-${di}`;
                  const isHovered = hoveredIndex === hKey;
                  const color = CHART_COLORS[di % CHART_COLORS.length];
                  return (
                    <div
                      key={di}
                      className="flex flex-col items-center cursor-default"
                      onMouseEnter={() => setHoveredIndex(hKey)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      <span
                        className="text-[10px] font-semibold mb-1 tabular-nums transition-opacity"
                        style={{ color, opacity: isHovered ? 1 : 0.7 }}
                      >
                        {val.toLocaleString()}
                      </span>
                      <div
                        className="rounded-t transition-all duration-500 ease-out"
                        style={{
                          width: singleBarW,
                          height: mounted ? `${(pct / 100) * barH}px` : "0px",
                          background: `linear-gradient(180deg, ${color}, ${color}cc)`,
                          opacity: isHovered ? 1 : 0.82,
                          transform: isHovered ? "scaleY(1.03)" : "scaleY(1)",
                          transformOrigin: "bottom",
                        }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="h-px w-full bg-gray-200 mt-0" />
              <span className="text-xs text-gray-500 mt-2 truncate w-full text-center px-1">{label}</span>
            </div>
          ))}
        </div>
        {datasets.length > 1 && (
          <div className="flex justify-center gap-5 pt-1 border-t border-gray-100">
            {datasets.map((ds, di) => (
              <span key={di} className="flex items-center gap-1.5 text-xs text-gray-500">
                <span
                  className="h-2.5 w-2.5 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: CHART_COLORS[di % CHART_COLORS.length] }}
                />
                {ds.name}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (chart_type === "pie") {
    const ds = datasets[0] || { values: [] };
    const values = ds.values || [];
    const total = values.reduce((s, v) => s + v, 0) || 1;
    let cumAngle = -Math.PI / 2;
    const cx = 90;
    const cy = 90;
    const outerR = 80;
    const innerR = 48;

    const slices = labels.map((label, i) => {
      const val = values[i] ?? 0;
      const angle = (val / total) * 2 * Math.PI;
      const x1o = cx + outerR * Math.cos(cumAngle);
      const y1o = cy + outerR * Math.sin(cumAngle);
      const x1i = cx + innerR * Math.cos(cumAngle);
      const y1i = cy + innerR * Math.sin(cumAngle);
      cumAngle += angle;
      const x2o = cx + outerR * Math.cos(cumAngle);
      const y2o = cy + outerR * Math.sin(cumAngle);
      const x2i = cx + innerR * Math.cos(cumAngle);
      const y2i = cy + innerR * Math.sin(cumAngle);
      const largeArc = angle > Math.PI ? 1 : 0;
      const color = CHART_COLORS[i % CHART_COLORS.length];
      return { label, val, x1o, y1o, x1i, y1i, x2o, y2o, x2i, y2i, largeArc, color };
    });

    return (
      <div className="flex items-center gap-8 flex-wrap">
        <svg width={180} height={180} className="flex-shrink-0">
          {slices.map((s, i) => {
            const isHovered = hoveredIndex === String(i);
            return (
              <path
                key={i}
                d={`M ${s.x1o} ${s.y1o} A ${outerR} ${outerR} 0 ${s.largeArc} 1 ${s.x2o} ${s.y2o} L ${s.x2i} ${s.y2i} A ${innerR} ${innerR} 0 ${s.largeArc} 0 ${s.x1i} ${s.y1i} Z`}
                fill={s.color}
                stroke="white"
                strokeWidth={2.5}
                className="cursor-pointer transition-all duration-200"
                style={{
                  opacity: isHovered ? 1 : 0.88,
                  transform: isHovered ? "scale(1.04)" : "scale(1)",
                  transformOrigin: `${cx}px ${cy}px`,
                }}
                onMouseEnter={() => setHoveredIndex(String(i))}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}
          <text x={cx} y={cy - 4} textAnchor="middle" fontSize={18} fontWeight="bold" fill="#1f2937">
            {total}
          </text>
          <text x={cx} y={cy + 12} textAnchor="middle" fontSize={10} fill="#9ca3af">
            합계
          </text>
        </svg>
        <div className="space-y-2">
          {slices.map((s, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 text-sm cursor-pointer group"
              onMouseEnter={() => setHoveredIndex(String(i))}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <span
                className="h-3 w-3 rounded-full flex-shrink-0 transition-transform duration-150 group-hover:scale-125"
                style={{ backgroundColor: s.color }}
              />
              <span className="text-gray-700 group-hover:text-gray-900 transition-colors">{s.label}</span>
              <span className="text-gray-400 text-xs ml-auto tabular-nums font-semibold">
                {s.val.toLocaleString()} ({Math.round((s.val / total) * 100)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // line chart with cubic bezier curves
  const allValues = datasets.flatMap((d) => d.values || []);
  const maxVal = Math.max(...allValues, 1);
  const minVal = Math.min(...allValues, 0);
  const range = maxVal - minVal || 1;
  const W = 360;
  const H = 160;
  const padX = 30;
  const padY = 20;
  const innerW = W - padX * 2;
  const innerH = H - padY * 2;
  const xStep = labels.length > 1 ? innerW / (labels.length - 1) : 0;

  const getPoint = (v: number, idx: number) => ({
    x: padX + idx * xStep,
    y: padY + innerH - ((v - minVal) / range) * innerH,
  });

  const buildCurvePath = (vals: number[]) => {
    if (vals.length === 0) return "";
    const pts = vals.map((v, idx) => getPoint(v, idx));
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let k = 0; k < pts.length - 1; k++) {
      const p0 = pts[Math.max(0, k - 1)];
      const p1 = pts[k];
      const p2 = pts[k + 1];
      const p3 = pts[Math.min(pts.length - 1, k + 2)];
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  const gridLines = 4;

  return (
    <div className="space-y-3">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="w-full">
        {Array.from({ length: gridLines + 1 }).map((_, gi) => {
          const y = padY + (innerH / gridLines) * gi;
          const val = maxVal - (range / gridLines) * gi;
          return (
            <g key={gi}>
              <line x1={padX} y1={y} x2={W - padX} y2={y} stroke="#f3f4f6" strokeWidth={1} />
              <text x={padX - 6} y={y + 3} textAnchor="end" fontSize={9} fill="#9ca3af">
                {Math.round(val)}
              </text>
            </g>
          );
        })}
        {datasets.map((ds, di) => {
          const values = ds.values || [];
          const curvePath = buildCurvePath(values);
          const color = CHART_COLORS[di % CHART_COLORS.length];
          const gradId = `area-grad-${di}`;
          const lastPt = getPoint(values[values.length - 1] ?? 0, values.length - 1);
          const firstPt = getPoint(values[0] ?? 0, 0);
          const areaPath = `${curvePath} L ${lastPt.x} ${padY + innerH} L ${firstPt.x} ${padY + innerH} Z`;
          return (
            <g key={di}>
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <path d={areaPath} fill={`url(#${gradId})`} />
              <path d={curvePath} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
              {values.map((v, vi) => {
                const pt = getPoint(v, vi);
                return (
                  <g key={vi}>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={3.5}
                      fill="white"
                      stroke={color}
                      strokeWidth={2}
                    />
                    <text
                      x={pt.x}
                      y={pt.y - 10}
                      textAnchor="middle"
                      fontSize={10}
                      fontWeight="600"
                      fill={color}
                    >
                      {v.toLocaleString()}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
      <div className="flex justify-between text-xs text-gray-400 px-8">
        {labels.map((l, li) => (
          <span key={li}>{l}</span>
        ))}
      </div>
      {datasets.length > 1 && (
        <div className="flex justify-center gap-4 pt-1">
          {datasets.map((ds, di) => (
            <span key={di} className="flex items-center gap-1.5 text-xs text-gray-600">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: CHART_COLORS[di % CHART_COLORS.length] }}
              />
              {ds.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Mindmap ──────────────────────────────────────────────────────────────────

function MindmapNodeView({
  node,
  depth,
}: {
  node: MindmapNode;
  depth: number;
}) {
  const [expanded, setExpanded] = useState(true);
  const [hovered, setHovered] = useState(false);
  const hasChildren = (node.children || []).length > 0;

  const depthOpacity = Math.max(0.4, 1 - depth * 0.15);

  return (
    <div className="relative">
      <div
        onClick={() => hasChildren && setExpanded(!expanded)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`flex items-center gap-2 mb-2 ${hasChildren ? "cursor-pointer" : ""}`}
      >
        {depth > 0 && (
          <svg
            className="flex-shrink-0"
            width={24}
            height={20}
            style={{ marginLeft: (depth - 1) * 24 }}
          >
            <path
              d="M 0 0 C 0 16, 12 20, 24 20"
              fill="none"
              stroke={`rgba(99, 102, 241, ${depthOpacity * 0.4})`}
              strokeWidth={2}
              strokeLinecap="round"
            />
          </svg>
        )}
        <span
          className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-all duration-200 select-none ${
            depth === 0
              ? "bg-indigo-600 text-white shadow-md"
              : "bg-white text-gray-800 border border-gray-200"
          } ${hovered && depth > 0 ? "shadow-md border-indigo-300" : ""}`}
          style={depth > 0 ? { opacity: depthOpacity } : undefined}
        >
          {hasChildren && (
            <span className="mr-1.5 text-xs opacity-50">
              {expanded ? "▾" : "▸"}
            </span>
          )}
          {node.label}
        </span>
      </div>
      {expanded && hasChildren && (
        <div className="ml-4 pl-4 border-l-2 border-indigo-100/60">
          {(node.children || []).map((child, i) => (
            <MindmapNodeView key={i} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function MindmapView({ widget }: { widget: MindmapWidget }) {
  const { root = "", children = [] } = widget.data || {};
  const rootNode: MindmapNode = { label: root, children };

  return (
    <div className="p-2">
      <MindmapNodeView node={rootNode} depth={0} />
    </div>
  );
}

// ─── Radial Map ───────────────────────────────────────────────────────────────

const RADIAL_BRANCH_COLORS = [
  { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700", line: "#c7d2fe" },
  { bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-700", line: "#ddd6fe" },
  { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", line: "#bfdbfe" },
  { bg: "bg-teal-50", border: "border-teal-200", text: "text-teal-700", line: "#99f6e4" },
  { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", line: "#fde68a" },
  { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-700", line: "#fecdd3" },
];

function RadialBranch({
  node,
  colorIdx,
  side,
}: {
  node: MindmapNode;
  colorIdx: number;
  side: "left" | "right";
}) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const color = RADIAL_BRANCH_COLORS[colorIdx % RADIAL_BRANCH_COLORS.length];

  const toggleCollapse = (label: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const renderNode = (n: MindmapNode, depth: number, key: string): React.ReactNode => {
    const kids = n.children || [];
    const isCollapsed = collapsed.has(key);
    const hasKids = kids.length > 0;

    return (
      <div key={key} className={`flex ${side === "left" ? "flex-row-reverse" : "flex-row"} items-center gap-3`}>
        <div
          onClick={() => hasKids && toggleCollapse(key)}
          className={`whitespace-nowrap rounded-full font-medium border-2 transition-all duration-200 select-none ${
            hasKids ? "cursor-pointer hover:shadow-lg hover:scale-105" : ""
          } ${
            depth === 0
              ? `${color.bg} ${color.border} ${color.text} shadow-sm px-5 py-2 text-sm`
              : "bg-white border-gray-200 text-gray-700 hover:border-indigo-200 px-4 py-1.5 text-sm"
          }`}
        >
          {hasKids && (
            <span className="mr-1.5 text-[10px] opacity-40">
              {isCollapsed ? (side === "left" ? "◂" : "▸") : "▾"}
            </span>
          )}
          {n.label}
        </div>

        {hasKids && !isCollapsed && (
          <div className={`flex ${side === "left" ? "flex-row-reverse" : "flex-row"} items-center gap-2`}>
            <div className="w-8 h-0.5 rounded-full" style={{ backgroundColor: color.line }} />
            <div className="flex flex-col gap-3">
              {kids.map((child, ci) => (
                <div key={ci} className={`flex ${side === "left" ? "flex-row-reverse" : "flex-row"} items-center gap-2`}>
                  <div className="w-5 h-0.5 rounded-full" style={{ backgroundColor: color.line, opacity: 0.6 }} />
                  {renderNode(child, depth + 1, `${key}-${ci}`)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return renderNode(node, 0, `branch-${colorIdx}`);
}

function RadialMapView({ widget }: { widget: RadialMapWidget }) {
  const { root = "", children = [] } = widget.data || {};

  const leftChildren = children.slice(0, Math.ceil(children.length / 2));
  const rightChildren = children.slice(Math.ceil(children.length / 2));

  return (
    <div className="overflow-x-auto py-4">
      <div className="flex items-center justify-center min-w-fit px-6">
        {/* Left branches */}
        <div className="flex flex-col gap-6 items-end">
          {leftChildren.map((child, i) => (
            <div key={i} className="flex items-center gap-3">
              <RadialBranch node={child} colorIdx={i} side="left" />
              <div className="w-10 h-0.5 rounded-full bg-indigo-200" />
            </div>
          ))}
        </div>

        {/* Root node */}
        <div className="flex-shrink-0 px-7 py-3.5 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200/50 ring-[6px] ring-indigo-100 z-10 mx-1">
          {root}
        </div>

        {/* Right branches */}
        <div className="flex flex-col gap-6 items-start">
          {rightChildren.map((child, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-0.5 rounded-full bg-indigo-200" />
              <RadialBranch node={child} colorIdx={leftChildren.length + i} side="right" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Kanban ───────────────────────────────────────────────────────────────────

const KANBAN_TOP_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#3b82f6",
  "#14b8a6",
  "#f59e0b",
  "#10b981",
];

function KanbanView({ widget }: { widget: KanbanWidget }) {
  const columns = widget.data?.columns || [];

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {columns.map((col, ci) => {
        const cards = col.cards || [];
        return (
          <div key={ci} className="flex-shrink-0 w-56 min-w-[14rem]">
            <div className="rounded-t-xl bg-white px-4 py-3 flex items-center justify-between border border-b-0 border-gray-200"
              style={{ borderTopColor: KANBAN_TOP_COLORS[ci % KANBAN_TOP_COLORS.length], borderTopWidth: 3 }}
            >
              <span className="text-sm font-semibold text-gray-800 truncate">{col.title}</span>
              <span className="ml-2 bg-gray-100 text-gray-500 text-xs font-bold rounded-full px-2 py-0.5 flex-shrink-0 tabular-nums">
                {cards.length}
              </span>
            </div>
            <div className="bg-gray-50/80 rounded-b-xl p-2.5 space-y-2 min-h-[5rem] border border-t-0 border-gray-200">
              {cards.map((card, ki) => (
                <div
                  key={ki}
                  className="bg-white rounded-xl px-3.5 py-2.5 text-sm text-gray-700 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 hover:border-indigo-200 transition-all duration-200 cursor-default"
                >
                  {card}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Progress ─────────────────────────────────────────────────────────────────

function ProgressView({ widget }: { widget: ProgressWidget }) {
  const items = widget.data?.items || [];

  return (
    <div className="space-y-4">
      {items.map((item, i) => {
        const max = item.max ?? 100;
        const pct = Math.min(100, Math.max(0, (item.value / max) * 100));
        const gradient =
          pct < 30
            ? "from-red-400 to-red-500"
            : pct < 70
            ? "from-amber-400 to-amber-500"
            : "from-emerald-400 to-emerald-500";
        const textColor =
          pct < 30
            ? "text-red-500"
            : pct < 70
            ? "text-amber-500"
            : "text-emerald-600";

        return (
          <div key={i}>
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-sm font-medium text-gray-700">
                {item.label}
              </span>
              <span className={`text-xs font-bold ${textColor} tabular-nums`}>
                {Math.round(pct)}%
              </span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-700 relative overflow-hidden`}
                style={{ width: `${pct}%` }}
              >
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 6px, rgba(255,255,255,0.4) 6px, rgba(255,255,255,0.4) 12px)",
                    animation: "progress-stripe 1s linear infinite",
                  }}
                />
              </div>
            </div>
            <style>{`@keyframes progress-stripe { 0% { background-position: 0 0; } 100% { background-position: 24px 0; } }`}</style>
          </div>
        );
      })}
    </div>
  );
}

// ─── Quote ────────────────────────────────────────────────────────────────────

function QuoteView({ widget }: { widget: QuoteWidget }) {
  const { text = "", author, style = "info" } = widget.data || {};

  const borderColor =
    style === "warning"
      ? "border-amber-400"
      : style === "success"
      ? "border-emerald-400"
      : "border-indigo-400";

  const bgColor =
    style === "warning"
      ? "bg-amber-50/60"
      : style === "success"
      ? "bg-emerald-50/60"
      : "bg-indigo-50/60";

  const quoteColor =
    style === "warning"
      ? "#fcd34d"
      : style === "success"
      ? "#6ee7b7"
      : "#a5b4fc";

  const authorColor =
    style === "warning"
      ? "text-amber-600"
      : style === "success"
      ? "text-emerald-600"
      : "text-indigo-600";

  return (
    <div className={`relative border-l-[4px] ${borderColor} ${bgColor} rounded-r-xl p-6`}>
      <svg
        className="absolute top-3 left-4 opacity-20 select-none"
        width={44}
        height={36}
        viewBox="0 0 44 36"
        fill={quoteColor}
      >
        <path d="M0 21.6c0-7.5 5.1-14.4 13.2-18L15.6 0C8.1 5.1 3 12.6 3 20.4c0 2.7.6 4.2 2.4 4.2 1.8 0 3-1.5 3-3.6 0-2.4-1.5-3.9-3.6-3.9-.6 0-1.2.15-1.5.3C3 13.8 6 9.6 12.6 6.9l-1.2-3.6C4.5 6.3 0 13.2 0 21.6zm24 0c0-7.5 5.1-14.4 13.2-18L39.6 0C32.1 5.1 27 12.6 27 20.4c0 2.7.6 4.2 2.4 4.2 1.8 0 3-1.5 3-3.6 0-2.4-1.5-3.9-3.6-3.9-.6 0-1.2.15-1.5.3C27 13.8 30 9.6 36.6 6.9l-1.2-3.6C28.5 6.3 24 13.2 24 21.6z" />
      </svg>
      <p className="text-gray-800 text-sm leading-relaxed italic pl-4 pt-4 relative z-10">{text}</p>
      {author && (
        <p className={`mt-3 text-xs font-semibold ${authorColor} pl-4 relative z-10`}>
          — {author}
        </p>
      )}
    </div>
  );
}

// ─── Pros & Cons ──────────────────────────────────────────────────────────────

function ProsConsView({ widget }: { widget: ProsConsWidget }) {
  const { pros = [], cons = [] } = widget.data || {};

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-emerald-200">
          <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-sm font-bold text-emerald-700">장점</span>
        </div>
        <ul className="space-y-2">
          {pros.map((p, i) => (
            <li
              key={i}
              className="flex items-start gap-2.5 bg-emerald-50/60 border border-emerald-100 rounded-xl px-3.5 py-2.5 hover:bg-emerald-50 hover:shadow-sm transition-all duration-200"
            >
              <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="h-3 w-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm text-gray-700">{p}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-red-200">
          <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <svg className="h-3.5 w-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <span className="text-sm font-bold text-red-600">단점</span>
        </div>
        <ul className="space-y-2">
          {cons.map((c, i) => (
            <li
              key={i}
              className="flex items-start gap-2.5 bg-red-50/60 border border-red-100 rounded-xl px-3.5 py-2.5 hover:bg-red-50 hover:shadow-sm transition-all duration-200"
            >
              <div className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="h-3 w-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <span className="text-sm text-gray-700">{c}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─── Accordion ────────────────────────────────────────────────────────────────

function AccordionView({ widget }: { widget: AccordionWidget }) {
  const items = widget.data?.items || [];
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-0 divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={i} className="relative">
            {isOpen && (
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-indigo-500 rounded-r" />
            )}
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className={`w-full flex items-center justify-between px-5 py-4 text-left transition-colors duration-200 ${
                isOpen ? "bg-indigo-50/50" : "bg-white hover:bg-gray-50"
              }`}
            >
              <span className={`text-sm font-medium ${isOpen ? "text-indigo-700" : "text-gray-800"}`}>
                {item.title}
              </span>
              <svg
                className={`h-4 w-4 flex-shrink-0 ml-3 transition-transform duration-300 ${
                  isOpen ? "rotate-180 text-indigo-500" : "text-gray-400"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div
              className="transition-all duration-300 overflow-hidden"
              style={{ maxHeight: isOpen ? "500px" : "0px" }}
            >
              <div className="px-5 pb-4 pt-1 text-sm text-gray-600 leading-relaxed bg-gray-50/50">
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Link List ────────────────────────────────────────────────────────────────

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function LinkListView({ widget }: { widget: LinkListWidget }) {
  const items = widget.data?.items || [];

  const letterColors = ["bg-indigo-500", "bg-violet-500", "bg-blue-500", "bg-teal-500", "bg-amber-500", "bg-rose-500"];

  return (
    <div className="space-y-2.5">
      {items.map((item, i) => {
        const domain = extractDomain(item.url);
        const firstLetter = (domain[0] || "L").toUpperCase();
        const letterColor = letterColors[i % letterColors.length];
        return (
          <a
            key={i}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3.5 p-3.5 rounded-xl border border-gray-200 bg-white hover:shadow-md hover:border-indigo-200 transition-all duration-200 group"
          >
            <div className={`h-9 w-9 rounded-lg ${letterColor} flex items-center justify-center flex-shrink-0`}>
              <span className="text-white text-sm font-bold">{firstLetter}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 group-hover:text-indigo-700 transition-colors duration-200 truncate">
                {item.title}
              </p>
              {item.description && (
                <p className="mt-0.5 text-xs text-gray-400 line-clamp-1">
                  {item.description}
                </p>
              )}
              <span className="inline-block mt-1 text-xs text-indigo-400 bg-indigo-50 px-2 py-0.5 rounded-full">
                {domain}
              </span>
            </div>
            <svg
              className="h-4 w-4 text-gray-300 group-hover:text-indigo-400 group-hover:translate-x-0.5 flex-shrink-0 transition-all duration-200"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        );
      })}
    </div>
  );
}

// ─── Gallery ──────────────────────────────────────────────────────────────────

const GALLERY_GRADIENTS = [
  "from-indigo-400 to-violet-400",
  "from-blue-400 to-indigo-400",
  "from-teal-400 to-blue-400",
  "from-violet-400 to-pink-400",
  "from-amber-400 to-orange-400",
  "from-emerald-400 to-teal-400",
];

function GalleryView({ widget }: { widget: GalleryWidget }) {
  const items = widget.data?.items || [];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {items.map((item, i) => (
        <div
          key={i}
          className="rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-default group"
        >
          <div
            className={`h-2 bg-gradient-to-r ${GALLERY_GRADIENTS[i % GALLERY_GRADIENTS.length]}`}
          />
          <div className="p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold text-gray-800 leading-tight group-hover:text-indigo-700 transition-colors">
                {item.title}
              </p>
              {item.tag && (
                <span className="text-[10px] font-medium bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full px-2 py-0.5 flex-shrink-0">
                  {item.tag}
                </span>
              )}
            </div>
            <p className="mt-2 text-xs text-gray-500 leading-relaxed line-clamp-3">
              {item.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Rating ───────────────────────────────────────────────────────────────────

function StarIcon({ filled, partial }: { filled: boolean; partial?: number }) {
  const gradientId = partial !== undefined ? `partial-${Math.round(partial * 10)}` : undefined;
  const fill =
    partial !== undefined
      ? `url(#${gradientId})`
      : filled
      ? "url(#star-gradient)"
      : "#e5e7eb";

  return (
    <svg className="h-6 w-6 flex-shrink-0" viewBox="0 0 20 20" fill={fill}>
      <defs>
        <linearGradient id="star-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        {partial !== undefined && gradientId && (
          <linearGradient id={gradientId}>
            <stop offset={`${partial * 100}%`} stopColor="#f59e0b" />
            <stop offset={`${partial * 100}%`} stopColor="#e5e7eb" />
          </linearGradient>
        )}
      </defs>
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function RatingView({ widget }: { widget: RatingWidget }) {
  const items = widget.data?.items || [];

  return (
    <div className="space-y-4">
      {items.map((item, i) => {
        const max = item.max ?? 5;
        const score = Math.min(max, Math.max(0, item.score));
        const pct = (score / max) * 100;
        const scoreColor =
          pct < 40
            ? "text-red-500"
            : pct < 70
            ? "text-amber-500"
            : "text-emerald-600";

        return (
          <div key={i} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {item.label}
              </span>
              <span className={`text-lg font-bold ${scoreColor} tabular-nums`}>
                {score}<span className="text-xs text-gray-400 font-normal">/{max}</span>
              </span>
            </div>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: max }).map((_, si) => {
                const isFilled = si < Math.floor(score);
                const partialVal = !isFilled && si < score ? score - Math.floor(score) : undefined;
                return (
                  <StarIcon key={si} filled={isFilled} partial={partialVal} />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Process (NEW) ────────────────────────────────────────────────────────────

function ProcessView({ widget }: { widget: ProcessWidget }) {
  const steps = widget.data?.steps || [];

  return (
    <div className="overflow-x-auto">
      <div className="flex items-start gap-0 min-w-fit py-2">
        {steps.map((step, i) => (
          <div key={i} className="flex items-start">
            <div className="flex flex-col items-center min-w-[100px]">
              <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200 flex-shrink-0">
                <span className="text-white text-sm font-bold">{i + 1}</span>
              </div>
              <p className="mt-3 text-sm font-semibold text-gray-800 text-center px-2 leading-tight">
                {step.label}
              </p>
              {step.description && (
                <p className="mt-1 text-xs text-gray-500 text-center px-2 leading-relaxed max-w-[120px]">
                  {step.description}
                </p>
              )}
            </div>
            {i < steps.length - 1 && (
              <div className="flex items-center h-10 px-1">
                <svg width={40} height={12} viewBox="0 0 40 12" className="flex-shrink-0">
                  <line x1="0" y1="6" x2="30" y2="6" stroke="#c7d2fe" strokeWidth={2} strokeLinecap="round" />
                  <path d="M28 2l6 4-6 4" fill="none" stroke="#6366f1" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Metric (NEW) ─────────────────────────────────────────────────────────────

function MetricView({ widget }: { widget: MetricWidget }) {
  const items = widget.data?.items || [];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {items.map((item, i) => {
        const trend = item.trend || "neutral";
        const trendColor = trend === "up" ? "text-emerald-600 bg-emerald-50" : trend === "down" ? "text-red-500 bg-red-50" : "text-gray-500 bg-gray-100";
        return (
          <div
            key={i}
            className="rounded-xl bg-white border border-gray-200 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{item.label}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900 tabular-nums">{item.value}</p>
            {item.delta && (
              <div className={`mt-2 inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${trendColor}`}>
                {trend === "up" && (
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                  </svg>
                )}
                {trend === "down" && (
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                )}
                {trend === "neutral" && (
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                  </svg>
                )}
                {item.delta}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── SWOT (NEW) ───────────────────────────────────────────────────────────────

function SwotView({ widget }: { widget: SwotWidget }) {
  const { strengths = [], weaknesses = [], opportunities = [], threats = [] } = widget.data || {};

  const quadrants = [
    { title: "Strengths", items: strengths, bg: "bg-emerald-50/60", border: "border-emerald-200", headerBg: "bg-emerald-100", headerText: "text-emerald-800", icon: "S", iconBg: "bg-emerald-500", dot: "bg-emerald-400" },
    { title: "Weaknesses", items: weaknesses, bg: "bg-amber-50/60", border: "border-amber-200", headerBg: "bg-amber-100", headerText: "text-amber-800", icon: "W", iconBg: "bg-amber-500", dot: "bg-amber-400" },
    { title: "Opportunities", items: opportunities, bg: "bg-blue-50/60", border: "border-blue-200", headerBg: "bg-blue-100", headerText: "text-blue-800", icon: "O", iconBg: "bg-blue-500", dot: "bg-blue-400" },
    { title: "Threats", items: threats, bg: "bg-red-50/60", border: "border-red-200", headerBg: "bg-red-100", headerText: "text-red-800", icon: "T", iconBg: "bg-red-500", dot: "bg-red-400" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {quadrants.map((q, i) => (
        <div key={i} className={`rounded-xl ${q.bg} border ${q.border} overflow-hidden`}>
          <div className={`${q.headerBg} px-4 py-2.5 flex items-center gap-2`}>
            <div className={`h-6 w-6 rounded-md ${q.iconBg} flex items-center justify-center`}>
              <span className="text-white text-xs font-bold">{q.icon}</span>
            </div>
            <span className={`text-sm font-bold ${q.headerText}`}>{q.title}</span>
          </div>
          <ul className="p-3.5 space-y-1.5">
            {q.items.map((item, j) => (
              <li key={j} className="flex items-start gap-2 text-sm text-gray-700">
                <span className={`h-1.5 w-1.5 rounded-full ${q.dot} flex-shrink-0 mt-1.5`} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

// ─── Comparison (NEW) ─────────────────────────────────────────────────────────

function ComparisonView({ widget }: { widget: ComparisonWidget }) {
  const columns = widget.data?.columns || [];
  const features = widget.data?.features || [];

  return (
    <div className="overflow-x-auto -mx-6 -mb-6">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider sticky left-0 bg-white z-10">
              기능
            </th>
            {columns.map((col, ci) => (
              <th
                key={ci}
                className="px-5 py-3.5 text-center text-xs font-bold text-indigo-700 uppercase tracking-wider bg-indigo-50/50"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {features.map((feature, fi) => (
            <tr
              key={fi}
              className={`hover:bg-indigo-50/40 transition-colors duration-150 ${
                fi % 2 === 1 ? "bg-gray-50/50" : "bg-white"
              }`}
            >
              <td className="px-5 py-3.5 font-medium text-gray-900 sticky left-0 bg-inherit z-10">
                {feature.name}
              </td>
              {feature.values.map((val, vi) => (
                <td key={vi} className="px-5 py-3.5 text-center">
                  {typeof val === "boolean" ? (
                    val ? (
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-emerald-100">
                        <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-red-100">
                        <svg className="h-3.5 w-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </span>
                    )
                  ) : (
                    <span className="text-gray-700">{val}</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Poll (NEW) ───────────────────────────────────────────────────────────────

function PollView({ widget }: { widget: PollWidget }) {
  const items = widget.data?.items || [];
  const totalVotes = items.reduce((sum, item) => sum + (item.votes || 0), 0) || 1;
  const maxVotes = Math.max(...items.map((item) => item.votes || 0), 1);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const pct = ((item.votes || 0) / totalVotes) * 100;
        const isMax = (item.votes || 0) === maxVotes;
        return (
          <div key={i} className="group">
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-sm font-medium ${isMax ? "text-indigo-700" : "text-gray-700"}`}>
                {item.label}
              </span>
              <span className="text-xs text-gray-500 tabular-nums">
                {item.votes || 0}표 · {Math.round(pct)}%
              </span>
            </div>
            <div className="h-8 bg-gray-100 rounded-lg overflow-hidden relative">
              <div
                className="h-full rounded-lg transition-all duration-700 ease-out"
                style={{
                  width: mounted ? `${Math.max(pct, 2)}%` : "0%",
                  background: isMax
                    ? "linear-gradient(90deg, #6366f1, #8b5cf6)"
                    : "linear-gradient(90deg, #c7d2fe, #ddd6fe)",
                }}
              />
            </div>
          </div>
        );
      })}
      <div className="text-xs text-gray-400 text-right pt-1">
        총 {totalVotes}표
      </div>
    </div>
  );
}

// ─── Renderer ─────────────────────────────────────────────────────────────────

export default function WidgetRenderer({ widgets }: { widgets: Widget[] }) {
  if (!widgets || widgets.length === 0) return null;

  return (
    <div className="space-y-6">
      {widgets.map((widget, i) => (
        <div
          key={i}
          className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden w-full"
        >
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/80">
            <h3 className="text-sm font-semibold text-gray-900">{widget.title}</h3>
          </div>
          <div className="p-6">
            {widget.type === "table" && (
              <TableView widget={widget as TableWidget} />
            )}
            {widget.type === "timeline" && (
              <TimelineView widget={widget as TimelineWidget} />
            )}
            {widget.type === "checklist" && (
              <ChecklistView widget={widget as ChecklistWidget} />
            )}
            {widget.type === "summary_card" && (
              <SummaryCardView widget={widget as SummaryCardWidget} />
            )}
            {widget.type === "chart" && (
              <ChartView widget={widget as ChartWidget} />
            )}
            {widget.type === "mindmap" && (
              <MindmapView widget={widget as MindmapWidget} />
            )}
            {widget.type === "radial_map" && (
              <RadialMapView widget={widget as RadialMapWidget} />
            )}
            {widget.type === "kanban" && (
              <KanbanView widget={widget as KanbanWidget} />
            )}
            {widget.type === "progress" && (
              <ProgressView widget={widget as ProgressWidget} />
            )}
            {widget.type === "quote" && (
              <QuoteView widget={widget as QuoteWidget} />
            )}
            {widget.type === "pros_cons" && (
              <ProsConsView widget={widget as ProsConsWidget} />
            )}
            {widget.type === "accordion" && (
              <AccordionView widget={widget as AccordionWidget} />
            )}
            {widget.type === "link_list" && (
              <LinkListView widget={widget as LinkListWidget} />
            )}
            {widget.type === "gallery" && (
              <GalleryView widget={widget as GalleryWidget} />
            )}
            {widget.type === "rating" && (
              <RatingView widget={widget as RatingWidget} />
            )}
            {widget.type === "process" && (
              <ProcessView widget={widget as ProcessWidget} />
            )}
            {widget.type === "metric" && (
              <MetricView widget={widget as MetricWidget} />
            )}
            {widget.type === "swot" && (
              <SwotView widget={widget as SwotWidget} />
            )}
            {widget.type === "comparison" && (
              <ComparisonView widget={widget as ComparisonWidget} />
            )}
            {widget.type === "poll" && (
              <PollView widget={widget as PollWidget} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
