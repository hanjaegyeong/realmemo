"use client";

import { useState } from "react";
import WidgetRenderer from "./Widgets";

// ─── Types ───────────────────────────────────────────────────────────────────

interface WidgetData {
  type: string;
  title: string;
  data: Record<string, unknown>;
}

interface WidgetManagerProps {
  widgets: WidgetData[];
  onWidgetsChange: (widgets: WidgetData[]) => void;
}

// ─── Widget Type Registry ────────────────────────────────────────────────────

export const WIDGET_TYPES: { type: string; label: string; emoji: string; description: string }[] = [
  { type: "table", label: "테이블", emoji: "📊", description: "행과 열로 데이터를 정리" },
  { type: "timeline", label: "타임라인", emoji: "📅", description: "시간순 이벤트 나열" },
  { type: "checklist", label: "체크리스트", emoji: "✅", description: "할 일 목록 관리" },
  { type: "summary_card", label: "요약 카드", emoji: "📋", description: "핵심 정보를 라벨-값 쌍으로" },
  { type: "chart", label: "차트", emoji: "📈", description: "막대·파이·라인 차트" },
  { type: "mindmap", label: "마인드맵", emoji: "🧠", description: "트리 구조 시각화" },
  { type: "radial_map", label: "방사형 맵", emoji: "🎯", description: "방사형 마인드맵" },
  { type: "kanban", label: "칸반", emoji: "📌", description: "열 기반 작업 보드" },
  { type: "progress", label: "진행률", emoji: "⏳", description: "진행 상황을 바로 표시" },
  { type: "quote", label: "인용구", emoji: "💬", description: "인용문과 출처 표시" },
  { type: "pros_cons", label: "장단점", emoji: "⚖️", description: "장점과 단점을 비교" },
  { type: "accordion", label: "아코디언", emoji: "🪗", description: "접고 펼치는 섹션" },
  { type: "link_list", label: "링크 목록", emoji: "🔗", description: "URL 모음 정리" },
  { type: "gallery", label: "갤러리", emoji: "🖼️", description: "카드형 항목 갤러리" },
  { type: "rating", label: "평점", emoji: "⭐", description: "별점 기반 평가" },
  { type: "process", label: "프로세스", emoji: "🔄", description: "단계별 절차 시각화" },
  { type: "metric", label: "지표", emoji: "📉", description: "핵심 수치와 추세" },
  { type: "swot", label: "SWOT", emoji: "🔍", description: "강점·약점·기회·위협 분석" },
  { type: "comparison", label: "비교", emoji: "🔀", description: "옵션별 기능 비교표" },
  { type: "poll", label: "투표", emoji: "🗳️", description: "투표 결과 시각화" },
];

export function getDefaultData(type: string): Record<string, unknown> {
  switch (type) {
    case "table":
      return { headers: ["항목", "값"], rows: [["", ""]] };
    case "timeline":
      return { items: [{ date: "", event: "" }] };
    case "checklist":
      return { items: [""] };
    case "summary_card":
      return { items: [{ label: "", value: "" }] };
    case "chart":
      return {
        chart_type: "bar",
        labels: ["항목 1"],
        datasets: [{ name: "데이터셋", values: [0] }],
      };
    case "mindmap":
    case "radial_map":
      return { root: "", children: [] };
    case "kanban":
      return { columns: [{ title: "할 일", cards: [""] }] };
    case "progress":
      return { items: [{ label: "", value: 0, max: 100 }] };
    case "quote":
      return { text: "", author: "", style: "info" };
    case "pros_cons":
      return { pros: [""], cons: [""] };
    case "accordion":
      return { items: [{ title: "", content: "" }] };
    case "link_list":
      return { items: [{ title: "", url: "", description: "" }] };
    case "gallery":
      return { items: [{ title: "", description: "", tag: "" }] };
    case "rating":
      return { items: [{ label: "", score: 0, max: 5 }] };
    case "process":
      return { steps: [{ label: "", description: "" }] };
    case "metric":
      return {
        items: [{ label: "", value: "", delta: "", trend: "neutral" }],
      };
    case "swot":
      return { strengths: [""], weaknesses: [""], opportunities: [""], threats: [""] };
    case "comparison":
      return { columns: ["옵션 A", "옵션 B"], features: [{ name: "", values: ["", ""] }] };
    case "poll":
      return { items: [{ label: "", votes: 0 }] };
    default:
      return {};
  }
}

// ─── Form Components ─────────────────────────────────────────────────────────

const inputClass =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none transition";

const textareaClass =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none transition resize-y min-h-[80px]";

function RemoveRowButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 rounded-md p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 transition"
      title="삭제"
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );
}

function AddRowButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-2 rounded-lg border border-dashed border-gray-300 px-3 py-1.5 text-xs text-gray-500 hover:border-indigo-300 hover:text-indigo-500 transition"
    >
      + {label}
    </button>
  );
}

function FormLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-medium text-gray-500 mb-1">{children}</label>;
}

// ─── Type-Specific Form ──────────────────────────────────────────────────────

function WidgetDataForm({
  type,
  data,
  onChange,
}: {
  type: string;
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}) {
  switch (type) {
    case "table":
      return <TableForm data={data} onChange={onChange} />;
    case "timeline":
      return <ObjectListForm data={data} onChange={onChange} listKey="items" fields={[{ key: "date", label: "날짜" }, { key: "event", label: "이벤트" }]} />;
    case "checklist":
      return <StringListForm data={data} onChange={onChange} listKey="items" label="항목 (한 줄에 하나)" />;
    case "summary_card":
      return <ObjectListForm data={data} onChange={onChange} listKey="items" fields={[{ key: "label", label: "라벨" }, { key: "value", label: "값" }]} />;
    case "chart":
      return <ChartForm data={data} onChange={onChange} />;
    case "mindmap":
    case "radial_map":
      return <MindmapForm data={data} onChange={onChange} />;
    case "kanban":
      return <KanbanForm data={data} onChange={onChange} />;
    case "progress":
      return <ObjectListForm data={data} onChange={onChange} listKey="items" fields={[{ key: "label", label: "라벨" }, { key: "value", label: "값", inputType: "number" }, { key: "max", label: "최대값", inputType: "number" }]} />;
    case "quote":
      return <QuoteForm data={data} onChange={onChange} />;
    case "pros_cons":
      return <ProsConsForm data={data} onChange={onChange} />;
    case "accordion":
      return <ObjectListForm data={data} onChange={onChange} listKey="items" fields={[{ key: "title", label: "제목" }, { key: "content", label: "내용" }]} />;
    case "link_list":
      return <ObjectListForm data={data} onChange={onChange} listKey="items" fields={[{ key: "title", label: "제목" }, { key: "url", label: "URL" }, { key: "description", label: "설명" }]} />;
    case "gallery":
      return <ObjectListForm data={data} onChange={onChange} listKey="items" fields={[{ key: "title", label: "제목" }, { key: "description", label: "설명" }, { key: "tag", label: "태그" }]} />;
    case "rating":
      return <ObjectListForm data={data} onChange={onChange} listKey="items" fields={[{ key: "label", label: "라벨" }, { key: "score", label: "점수", inputType: "number" }, { key: "max", label: "최대점수", inputType: "number" }]} />;
    case "process":
      return <ObjectListForm data={data} onChange={onChange} listKey="steps" fields={[{ key: "label", label: "라벨" }, { key: "description", label: "설명" }]} />;
    case "metric":
      return <MetricForm data={data} onChange={onChange} />;
    case "swot":
      return <SwotForm data={data} onChange={onChange} />;
    case "comparison":
      return <ComparisonForm data={data} onChange={onChange} />;
    case "poll":
      return <ObjectListForm data={data} onChange={onChange} listKey="items" fields={[{ key: "label", label: "라벨" }, { key: "votes", label: "투표수", inputType: "number" }]} />;
    default:
      return <p className="text-sm text-gray-400">이 위젯 타입은 편집을 지원하지 않습니다.</p>;
  }
}

// ─── String List Form ────────────────────────────────────────────────────────

function StringListForm({
  data,
  onChange,
  listKey,
  label,
}: {
  data: Record<string, unknown>;
  onChange: (d: Record<string, unknown>) => void;
  listKey: string;
  label: string;
}) {
  const items = (data[listKey] as string[]) || [];
  const text = items.join("\n");

  return (
    <div>
      <FormLabel>{label}</FormLabel>
      <textarea
        className={textareaClass}
        value={text}
        onChange={(e) => {
          const lines = e.target.value.split("\n");
          onChange({ ...data, [listKey]: lines });
        }}
      />
    </div>
  );
}

// ─── Generic Object List Form ────────────────────────────────────────────────

interface FieldDef {
  key: string;
  label: string;
  inputType?: "text" | "number";
}

function ObjectListForm({
  data,
  onChange,
  listKey,
  fields,
}: {
  data: Record<string, unknown>;
  onChange: (d: Record<string, unknown>) => void;
  listKey: string;
  fields: FieldDef[];
}) {
  const items = (data[listKey] as Record<string, unknown>[]) || [];

  const updateItem = (index: number, key: string, value: string | number) => {
    const next = items.map((item, i) =>
      i === index ? { ...item, [key]: value } : item
    );
    onChange({ ...data, [listKey]: next });
  };

  const addItem = () => {
    const blank: Record<string, unknown> = {};
    for (const f of fields) {
      blank[f.key] = f.inputType === "number" ? 0 : "";
    }
    onChange({ ...data, [listKey]: [...items, blank] });
  };

  const removeItem = (index: number) => {
    onChange({ ...data, [listKey]: items.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          <div className="flex-1 grid gap-2" style={{ gridTemplateColumns: `repeat(${fields.length}, 1fr)` }}>
            {fields.map((f) => (
              <div key={f.key}>
                {i === 0 && <FormLabel>{f.label}</FormLabel>}
                <input
                  className={inputClass}
                  type={f.inputType || "text"}
                  value={String(item[f.key] ?? "")}
                  onChange={(e) => {
                    const val = f.inputType === "number" ? Number(e.target.value) : e.target.value;
                    updateItem(i, f.key, val);
                  }}
                />
              </div>
            ))}
          </div>
          <div className={i === 0 ? "mt-5" : ""}>
            <RemoveRowButton onClick={() => removeItem(i)} />
          </div>
        </div>
      ))}
      <AddRowButton onClick={addItem} label="행 추가" />
    </div>
  );
}

// ─── Table Form ──────────────────────────────────────────────────────────────

function TableForm({
  data,
  onChange,
}: {
  data: Record<string, unknown>;
  onChange: (d: Record<string, unknown>) => void;
}) {
  const headers = (data.headers as string[]) || [""];
  const rows = (data.rows as string[][]) || [[""]];

  const updateHeader = (index: number, value: string) => {
    const next = headers.map((h, i) => (i === index ? value : h));
    onChange({ ...data, headers: next });
  };

  const updateCell = (rowIdx: number, colIdx: number, value: string) => {
    const next = rows.map((row, ri) =>
      ri === rowIdx ? row.map((c, ci) => (ci === colIdx ? value : c)) : row
    );
    onChange({ ...data, rows: next });
  };

  const addColumn = () => {
    onChange({
      ...data,
      headers: [...headers, ""],
      rows: rows.map((row) => [...row, ""]),
    });
  };

  const addRow = () => {
    onChange({
      ...data,
      rows: [...rows, Array(headers.length).fill("")],
    });
  };

  const removeRow = (index: number) => {
    onChange({ ...data, rows: rows.filter((_, i) => i !== index) });
  };

  const removeColumn = (index: number) => {
    if (headers.length <= 1) return;
    onChange({
      ...data,
      headers: headers.filter((_, i) => i !== index),
      rows: rows.map((row) => row.filter((_, i) => i !== index)),
    });
  };

  return (
    <div className="space-y-2">
      <FormLabel>헤더</FormLabel>
      <div className="flex gap-2 flex-wrap">
        {headers.map((h, i) => (
          <div key={i} className="flex items-center gap-1">
            <input
              className={inputClass + " !w-28"}
              value={h}
              onChange={(e) => updateHeader(i, e.target.value)}
            />
            {headers.length > 1 && <RemoveRowButton onClick={() => removeColumn(i)} />}
          </div>
        ))}
        <button
          type="button"
          onClick={addColumn}
          className="rounded-lg border border-dashed border-gray-300 px-2 py-1 text-xs text-gray-500 hover:border-indigo-300 hover:text-indigo-500 transition"
        >
          + 열
        </button>
      </div>

      <FormLabel>데이터 행</FormLabel>
      {rows.map((row, ri) => (
        <div key={ri} className="flex items-center gap-2">
          <div className="flex-1 flex gap-2 flex-wrap">
            {row.map((cell, ci) => (
              <input
                key={ci}
                className={inputClass + " !w-28"}
                value={cell}
                onChange={(e) => updateCell(ri, ci, e.target.value)}
              />
            ))}
          </div>
          <RemoveRowButton onClick={() => removeRow(ri)} />
        </div>
      ))}
      <AddRowButton onClick={addRow} label="행 추가" />
    </div>
  );
}

// ─── Chart Form ──────────────────────────────────────────────────────────────

function ChartForm({
  data,
  onChange,
}: {
  data: Record<string, unknown>;
  onChange: (d: Record<string, unknown>) => void;
}) {
  const chartType = (data.chart_type as string) || "bar";
  const labels = (data.labels as string[]) || [];
  const datasets = (data.datasets as { name: string; values: number[] }[]) || [];

  return (
    <div className="space-y-3">
      <div>
        <FormLabel>차트 타입</FormLabel>
        <select
          className={inputClass}
          value={chartType}
          onChange={(e) => onChange({ ...data, chart_type: e.target.value })}
        >
          <option value="bar">막대</option>
          <option value="pie">파이</option>
          <option value="line">라인</option>
        </select>
      </div>
      <div>
        <FormLabel>라벨 (한 줄에 하나)</FormLabel>
        <textarea
          className={textareaClass}
          value={labels.join("\n")}
          onChange={(e) => onChange({ ...data, labels: e.target.value.split("\n") })}
        />
      </div>
      <div className="space-y-2">
        <FormLabel>데이터셋</FormLabel>
        {datasets.map((ds, i) => (
          <div key={i} className="rounded-lg border border-gray-100 p-3 space-y-2">
            <div className="flex items-center gap-2">
              <input
                className={inputClass}
                placeholder="데이터셋 이름"
                value={ds.name}
                onChange={(e) => {
                  const next = datasets.map((d, j) =>
                    j === i ? { ...d, name: e.target.value } : d
                  );
                  onChange({ ...data, datasets: next });
                }}
              />
              <RemoveRowButton
                onClick={() =>
                  onChange({ ...data, datasets: datasets.filter((_, j) => j !== i) })
                }
              />
            </div>
            <textarea
              className={textareaClass + " !min-h-[40px]"}
              placeholder="값 (한 줄에 하나, 숫자)"
              value={ds.values.join("\n")}
              onChange={(e) => {
                const vals = e.target.value.split("\n").map((v) => Number(v) || 0);
                const next = datasets.map((d, j) =>
                  j === i ? { ...d, values: vals } : d
                );
                onChange({ ...data, datasets: next });
              }}
            />
          </div>
        ))}
        <AddRowButton
          onClick={() =>
            onChange({
              ...data,
              datasets: [...datasets, { name: "", values: labels.map(() => 0) }],
            })
          }
          label="데이터셋 추가"
        />
      </div>
    </div>
  );
}

// ─── Mindmap Form ────────────────────────────────────────────────────────────

interface MindmapNode {
  label: string;
  children?: MindmapNode[];
}

function treeToText(nodes: MindmapNode[]): string {
  return nodes.map((n) => n.label).join("\n");
}

function textToTree(text: string): MindmapNode[] {
  return text
    .split("\n")
    .filter((l) => l.trim())
    .map((label) => ({ label: label.trim(), children: [] }));
}

function MindmapForm({
  data,
  onChange,
}: {
  data: Record<string, unknown>;
  onChange: (d: Record<string, unknown>) => void;
}) {
  const root = (data.root as string) || "";
  const children = (data.children as MindmapNode[]) || [];
  const text = treeToText(children);

  return (
    <div className="space-y-3">
      <div>
        <FormLabel>루트 노드</FormLabel>
        <input
          className={inputClass}
          value={root}
          onChange={(e) => onChange({ ...data, root: e.target.value })}
        />
      </div>
      <div>
        <FormLabel>하위 노드 (엔터로 구분, 한 줄에 하나)</FormLabel>
        <textarea
          className={textareaClass + " !min-h-[120px] font-mono"}
          value={text}
          onChange={(e) => onChange({ ...data, children: textToTree(e.target.value) })}
        />
      </div>
    </div>
  );
}

// ─── Kanban Form ─────────────────────────────────────────────────────────────

function KanbanForm({
  data,
  onChange,
}: {
  data: Record<string, unknown>;
  onChange: (d: Record<string, unknown>) => void;
}) {
  const columns = (data.columns as { title: string; cards: string[] }[]) || [];

  const updateColumn = (index: number, field: "title" | "cards", value: string | string[]) => {
    const next = columns.map((col, i) =>
      i === index ? { ...col, [field]: value } : col
    );
    onChange({ ...data, columns: next });
  };

  return (
    <div className="space-y-3">
      {columns.map((col, i) => (
        <div key={i} className="rounded-lg border border-gray-100 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <input
              className={inputClass}
              placeholder="열 제목"
              value={col.title}
              onChange={(e) => updateColumn(i, "title", e.target.value)}
            />
            <RemoveRowButton
              onClick={() =>
                onChange({ ...data, columns: columns.filter((_, j) => j !== i) })
              }
            />
          </div>
          <textarea
            className={textareaClass + " !min-h-[60px]"}
            placeholder="카드 (한 줄에 하나)"
            value={col.cards.join("\n")}
            onChange={(e) => updateColumn(i, "cards", e.target.value.split("\n"))}
          />
        </div>
      ))}
      <AddRowButton
        onClick={() =>
          onChange({ ...data, columns: [...columns, { title: "", cards: [""] }] })
        }
        label="열 추가"
      />
    </div>
  );
}

// ─── Quote Form ──────────────────────────────────────────────────────────────

function QuoteForm({
  data,
  onChange,
}: {
  data: Record<string, unknown>;
  onChange: (d: Record<string, unknown>) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <FormLabel>인용문</FormLabel>
        <textarea
          className={textareaClass}
          value={(data.text as string) || ""}
          onChange={(e) => onChange({ ...data, text: e.target.value })}
        />
      </div>
      <div>
        <FormLabel>저자</FormLabel>
        <input
          className={inputClass}
          value={(data.author as string) || ""}
          onChange={(e) => onChange({ ...data, author: e.target.value })}
        />
      </div>
      <div>
        <FormLabel>스타일</FormLabel>
        <select
          className={inputClass}
          value={(data.style as string) || "info"}
          onChange={(e) => onChange({ ...data, style: e.target.value })}
        >
          <option value="info">정보</option>
          <option value="warning">경고</option>
          <option value="success">성공</option>
        </select>
      </div>
    </div>
  );
}

// ─── Pros/Cons Form ──────────────────────────────────────────────────────────

function ProsConsForm({
  data,
  onChange,
}: {
  data: Record<string, unknown>;
  onChange: (d: Record<string, unknown>) => void;
}) {
  const pros = (data.pros as string[]) || [];
  const cons = (data.cons as string[]) || [];

  return (
    <div className="space-y-3">
      <div>
        <FormLabel>장점 (한 줄에 하나)</FormLabel>
        <textarea
          className={textareaClass}
          value={pros.join("\n")}
          onChange={(e) => onChange({ ...data, pros: e.target.value.split("\n") })}
        />
      </div>
      <div>
        <FormLabel>단점 (한 줄에 하나)</FormLabel>
        <textarea
          className={textareaClass}
          value={cons.join("\n")}
          onChange={(e) => onChange({ ...data, cons: e.target.value.split("\n") })}
        />
      </div>
    </div>
  );
}

// ─── Metric Form ─────────────────────────────────────────────────────────────

function MetricForm({
  data,
  onChange,
}: {
  data: Record<string, unknown>;
  onChange: (d: Record<string, unknown>) => void;
}) {
  const items = (data.items as { label: string; value: string; delta?: string; trend?: string }[]) || [];

  const updateItem = (index: number, key: string, value: string) => {
    const next = items.map((item, i) =>
      i === index ? { ...item, [key]: value } : item
    );
    onChange({ ...data, items: next });
  };

  const addItem = () => {
    onChange({
      ...data,
      items: [...items, { label: "", value: "", delta: "", trend: "neutral" }],
    });
  };

  const removeItem = (index: number) => {
    onChange({ ...data, items: items.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          <div className="flex-1 grid grid-cols-4 gap-2">
            <div>
              {i === 0 && <FormLabel>라벨</FormLabel>}
              <input className={inputClass} value={item.label} onChange={(e) => updateItem(i, "label", e.target.value)} />
            </div>
            <div>
              {i === 0 && <FormLabel>값</FormLabel>}
              <input className={inputClass} value={item.value} onChange={(e) => updateItem(i, "value", e.target.value)} />
            </div>
            <div>
              {i === 0 && <FormLabel>변화량</FormLabel>}
              <input className={inputClass} value={item.delta || ""} onChange={(e) => updateItem(i, "delta", e.target.value)} />
            </div>
            <div>
              {i === 0 && <FormLabel>추세</FormLabel>}
              <select className={inputClass} value={item.trend || "neutral"} onChange={(e) => updateItem(i, "trend", e.target.value)}>
                <option value="up">상승</option>
                <option value="down">하락</option>
                <option value="neutral">보합</option>
              </select>
            </div>
          </div>
          <div className={i === 0 ? "mt-5" : ""}>
            <RemoveRowButton onClick={() => removeItem(i)} />
          </div>
        </div>
      ))}
      <AddRowButton onClick={addItem} label="행 추가" />
    </div>
  );
}

// ─── SWOT Form ───────────────────────────────────────────────────────────────

function SwotForm({
  data,
  onChange,
}: {
  data: Record<string, unknown>;
  onChange: (d: Record<string, unknown>) => void;
}) {
  const keys: { key: string; label: string }[] = [
    { key: "strengths", label: "강점 (한 줄에 하나)" },
    { key: "weaknesses", label: "약점 (한 줄에 하나)" },
    { key: "opportunities", label: "기회 (한 줄에 하나)" },
    { key: "threats", label: "위협 (한 줄에 하나)" },
  ];

  return (
    <div className="space-y-3">
      {keys.map(({ key, label }) => (
        <div key={key}>
          <FormLabel>{label}</FormLabel>
          <textarea
            className={textareaClass}
            value={((data[key] as string[]) || []).join("\n")}
            onChange={(e) => onChange({ ...data, [key]: e.target.value.split("\n") })}
          />
        </div>
      ))}
    </div>
  );
}

// ─── Comparison Form ─────────────────────────────────────────────────────────

function ComparisonForm({
  data,
  onChange,
}: {
  data: Record<string, unknown>;
  onChange: (d: Record<string, unknown>) => void;
}) {
  const columns = (data.columns as string[]) || [];
  const features = (data.features as { name: string; values: (boolean | string)[] }[]) || [];

  const updateColumn = (index: number, value: string) => {
    const next = columns.map((c, i) => (i === index ? value : c));
    onChange({ ...data, columns: next });
  };

  const addColumn = () => {
    onChange({
      ...data,
      columns: [...columns, ""],
      features: features.map((f) => ({ ...f, values: [...f.values, ""] })),
    });
  };

  const removeColumn = (index: number) => {
    if (columns.length <= 1) return;
    onChange({
      ...data,
      columns: columns.filter((_, i) => i !== index),
      features: features.map((f) => ({
        ...f,
        values: f.values.filter((_, i) => i !== index),
      })),
    });
  };

  const updateFeature = (fIdx: number, key: "name" | number, value: string) => {
    const next = features.map((f, i) => {
      if (i !== fIdx) return f;
      if (key === "name") return { ...f, name: value };
      const vals = [...f.values];
      vals[key] = value;
      return { ...f, values: vals };
    });
    onChange({ ...data, features: next });
  };

  const addFeature = () => {
    onChange({
      ...data,
      features: [...features, { name: "", values: columns.map(() => "") }],
    });
  };

  const removeFeature = (index: number) => {
    onChange({ ...data, features: features.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-3">
      <div>
        <FormLabel>비교 대상 (열)</FormLabel>
        <div className="flex gap-2 flex-wrap">
          {columns.map((col, i) => (
            <div key={i} className="flex items-center gap-1">
              <input
                className={inputClass + " !w-28"}
                value={col}
                onChange={(e) => updateColumn(i, e.target.value)}
              />
              {columns.length > 1 && <RemoveRowButton onClick={() => removeColumn(i)} />}
            </div>
          ))}
          <button
            type="button"
            onClick={addColumn}
            className="rounded-lg border border-dashed border-gray-300 px-2 py-1 text-xs text-gray-500 hover:border-indigo-300 hover:text-indigo-500 transition"
          >
            + 열
          </button>
        </div>
      </div>
      <div>
        <FormLabel>기능/특성</FormLabel>
        {features.map((feat, fi) => (
          <div key={fi} className="flex items-center gap-2 mb-2">
            <input
              className={inputClass + " !w-28"}
              placeholder="특성명"
              value={feat.name}
              onChange={(e) => updateFeature(fi, "name", e.target.value)}
            />
            {columns.map((_, ci) => (
              <input
                key={ci}
                className={inputClass + " !w-28"}
                placeholder={columns[ci] || `값 ${ci + 1}`}
                value={String(feat.values[ci] ?? "")}
                onChange={(e) => updateFeature(fi, ci, e.target.value)}
              />
            ))}
            <RemoveRowButton onClick={() => removeFeature(fi)} />
          </div>
        ))}
        <AddRowButton onClick={addFeature} label="특성 추가" />
      </div>
    </div>
  );
}

// ─── Type Selector Modal ─────────────────────────────────────────────────────

export function TypeSelectorModal({
  onSelect,
  onClose,
}: {
  onSelect: (type: string) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">위젯 타입 선택</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {WIDGET_TYPES.map((wt) => (
              <button
                key={wt.type}
                onClick={() => onSelect(wt.type)}
                className="group flex flex-col items-start gap-2 rounded-xl border border-gray-200 p-4 text-left hover:border-indigo-300 hover:bg-indigo-50/30 transition"
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{wt.emoji}</span>
                  <span className="text-sm font-semibold text-gray-800">{wt.label}</span>
                </div>
                <span className="text-xs text-gray-400 leading-snug">{wt.description}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Modal (auto-save) ─────────────────────────────────────────────────

export function WidgetEditModal({
  widget,
  onChange,
  onClose,
}: {
  widget: WidgetData;
  onChange: (widget: WidgetData) => void;
  onClose: () => void;
}) {
  const handleTitleChange = (title: string) => {
    onChange({ ...widget, title });
  };

  const handleDataChange = (data: Record<string, unknown>) => {
    onChange({ ...widget, data });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-3xl max-h-[80vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">
              {WIDGET_TYPES.find((w) => w.type === widget.type)?.emoji}
            </span>
            <h2 className="text-lg font-semibold text-gray-900">
              {WIDGET_TYPES.find((w) => w.type === widget.type)?.label} 편집
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600 transition"
          >
            완료
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Live Preview */}
          <div>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">미리보기</div>
            <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-5 overflow-x-auto">
              {widget.title.trim() ? (
                <WidgetRenderer widgets={[{ type: widget.type, title: widget.title.trim(), data: widget.data } as never]} />
              ) : (
                <div className="flex items-center justify-center py-6 text-sm text-gray-300">
                  제목을 입력하면 미리보기가 표시됩니다
                </div>
              )}
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <FormLabel>제목</FormLabel>
              <input
                className={inputClass}
                value={widget.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="위젯 제목"
              />
            </div>
            <WidgetDataForm type={widget.type} data={widget.data} onChange={handleDataChange} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function WidgetManager({ widgets, onWidgetsChange }: WidgetManagerProps) {
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleTypeSelected = (type: string) => {
    const label = WIDGET_TYPES.find((w) => w.type === type)?.label || "";
    const newWidget: WidgetData = { type, title: label, data: getDefaultData(type) };
    const newWidgets = [...widgets, newWidget];
    onWidgetsChange(newWidgets);
    setShowTypeSelector(false);
    setEditingIndex(newWidgets.length - 1);
  };

  const handleWidgetUpdate = (index: number, widget: WidgetData) => {
    const next = widgets.map((w, i) => (i === index ? widget : w));
    onWidgetsChange(next);
  };

  const handleDelete = (index: number) => {
    if (!window.confirm("이 위젯을 삭제하시겠습니까?")) return;
    onWidgetsChange(widgets.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
  };

  return (
    <div className="space-y-4">
      {widgets.map((widget, i) => (
        <div key={i} className="group relative rounded-xl border border-black/[0.06] bg-white p-6 hover:shadow-sm transition">
          <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
            <button
              onClick={() => setEditingIndex(i)}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-indigo-50 hover:text-indigo-500 transition"
              title="편집"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button
              onClick={() => handleDelete(i)}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition"
              title="삭제"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
          <WidgetRenderer widgets={[widget as never]} />
        </div>
      ))}

      <button
        onClick={() => setShowTypeSelector(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-4 text-gray-400 hover:border-indigo-300 hover:text-indigo-500 transition"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        위젯 추가
      </button>

      {showTypeSelector && (
        <TypeSelectorModal
          onSelect={handleTypeSelected}
          onClose={() => setShowTypeSelector(false)}
        />
      )}
      {editingIndex !== null && widgets[editingIndex] && (
        <WidgetEditModal
          widget={widgets[editingIndex]}
          onChange={(w) => handleWidgetUpdate(editingIndex, w)}
          onClose={() => setEditingIndex(null)}
        />
      )}
    </div>
  );
}
