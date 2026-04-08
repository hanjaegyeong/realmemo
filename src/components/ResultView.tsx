"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import MermaidDiagram from "./MermaidDiagram";
import WidgetRenderer from "./Widgets";

interface TransformResult {
  markdown: string;
  diagrams?: string[];
  widgets?: Array<{
    type: "table" | "timeline" | "checklist" | "summary_card";
    title: string;
    data: Record<string, unknown>;
  }>;
}

export default function ResultView({ result }: { result: TransformResult }) {
  return (
    <div className="space-y-8">
      {/* Markdown */}
      <div className="prose prose-indigo max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-li:text-gray-700 prose-a:text-indigo-600">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {result.markdown}
        </ReactMarkdown>
      </div>

      {/* Diagrams */}
      {result.diagrams && result.diagrams.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span className="h-6 w-1 bg-indigo-500 rounded-full" />
            다이어그램
          </h2>
          {result.diagrams.map((code, i) => (
            <MermaidDiagram key={i} code={code} />
          ))}
        </div>
      )}

      {/* Widgets */}
      {result.widgets && result.widgets.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span className="h-6 w-1 bg-indigo-500 rounded-full" />
            인터랙티브 요약
          </h2>
          <WidgetRenderer widgets={result.widgets as never} />
        </div>
      )}
    </div>
  );
}
