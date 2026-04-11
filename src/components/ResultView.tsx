"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import WidgetRenderer from "./Widgets";

interface TransformResult {
  markdown: string;
  diagrams?: string[];
  widgets?: Array<{
    type: string;
    title: string;
    data: Record<string, unknown>;
  }>;
}

export default function ResultView({ result }: { result: TransformResult }) {
  return (
    <div className="space-y-10">
      {/* Markdown */}
      <div className="prose max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {result.markdown}
        </ReactMarkdown>
      </div>

      {/* Widgets */}
      {result.widgets && result.widgets.length > 0 && (
        <div className="space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="h-5 w-0.5 bg-gray-900 rounded-full" />
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">인터랙티브 요약</h2>
          </div>
          <WidgetRenderer widgets={result.widgets as never} />
        </div>
      )}
    </div>
  );
}
