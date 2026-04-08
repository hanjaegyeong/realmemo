"use client";

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
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-indigo-200 bg-indigo-50">
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-3 text-left font-semibold text-indigo-900">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-gray-700">
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
  return (
    <div className="relative pl-6">
      <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-indigo-200" />
      {items.map((item, i) => (
        <div key={i} className="relative mb-4 last:mb-0">
          <div className="absolute -left-4 top-1.5 h-3 w-3 rounded-full border-2 border-indigo-500 bg-white" />
          <div className="ml-4">
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              {item.date}
            </span>
            <p className="mt-1 text-sm text-gray-700">{item.event}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ChecklistView({ widget }: { widget: ChecklistWidget }) {
  const items = widget.data?.items || [];
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2">
          <span className="mt-0.5 h-5 w-5 rounded border-2 border-gray-300 flex items-center justify-center flex-shrink-0">
            <span className="text-xs text-gray-400">&#10003;</span>
          </span>
          <span className="text-sm text-gray-700">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function SummaryCardView({ widget }: { widget: SummaryCardWidget }) {
  const items = widget.data?.items || [];
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item, i) => (
        <div key={i} className="rounded-lg bg-gradient-to-br from-indigo-50 to-white p-3 border border-indigo-100">
          <p className="text-xs text-indigo-500 font-medium">{item.label}</p>
          <p className="mt-1 text-lg font-bold text-gray-900">{item.value}</p>
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
            <h3 className="text-sm font-semibold text-gray-800">{widget.title}</h3>
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
