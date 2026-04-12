"use client";

import { useState, useRef, useCallback } from "react";
import RichTextEditor from "./RichTextEditor";
import { TypeSelectorModal, WidgetEditModal, WIDGET_TYPES, getDefaultData } from "./WidgetManager";
import type { TransformResult } from "@/lib/store";

// ─── Types ──────────────────────────────────────────────────────────────────

interface WidgetData {
  type: string;
  title: string;
  data: Record<string, unknown>;
}

interface ResultViewProps {
  result: TransformResult;
  onResultChange?: (result: TransformResult) => void;
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function ResultView({ result, onResultChange }: ResultViewProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorRef = useRef<any>(null);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [pendingWidget, setPendingWidget] = useState<WidgetData | null>(null);

  const handleEditorReady = useCallback((editor: unknown) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ed = editor as any;
    editorRef.current = ed;

    setTimeout(() => {
      if (result.editorJson) {
        // Restore full editor state from saved JSON (includes widgets)
        ed.commands.setContent(result.editorJson);
      } else if (result.widgets && result.widgets.length > 0) {
        // AI output: distribute widgets after matching sections
        const markdown = result.markdown || "";
        const widgets = result.widgets!;

        // Split markdown by ## headings
        const sections = markdown.split(/(?=^## )/m);
        const widgetNodes = widgets.map((w) => ({
          type: "widgetBlock" as const,
          attrs: {
            widgetType: w.type,
            widgetTitle: w.title,
            widgetData: JSON.stringify(w.data),
          },
        }));

        // Match widgets to sections by afterSection hint or distribute evenly
        const placed = new Set<number>();
        const sectionWidgets: Record<number, typeof widgetNodes> = {};

        // Try matching by afterSection hint
        for (let wi = 0; wi < widgets.length; wi++) {
          const w = widgets[wi] as Record<string, unknown>;
          if (w.afterSection && typeof w.afterSection === "string") {
            for (let si = 0; si < sections.length; si++) {
              if (sections[si].includes(w.afterSection as string)) {
                if (!sectionWidgets[si]) sectionWidgets[si] = [];
                sectionWidgets[si].push(widgetNodes[wi]);
                placed.add(wi);
                break;
              }
            }
          }
        }

        // Distribute remaining widgets evenly
        const unplaced = widgetNodes.filter((_, i) => !placed.has(i));
        if (unplaced.length > 0 && sections.length > 0) {
          const interval = Math.max(1, Math.floor(sections.length / (unplaced.length + 1)));
          for (let i = 0; i < unplaced.length; i++) {
            const si = Math.min((i + 1) * interval, sections.length - 1);
            if (!sectionWidgets[si]) sectionWidgets[si] = [];
            sectionWidgets[si].push(unplaced[i]);
          }
        }

        // Build interleaved content
        ed.commands.clearContent();
        for (let si = 0; si < sections.length; si++) {
          if (sections[si].trim()) {
            ed.chain().focus("end").insertContent(sections[si].trim()).run();
          }
          if (sectionWidgets[si]) {
            for (const wn of sectionWidgets[si]) {
              ed.chain().focus("end").insertContent(wn).run();
            }
          }
        }
      }
    }, 50);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleMarkdownChange(markdown: string) {
    const editorJson = editorRef.current?.getJSON();
    const widgets: WidgetData[] = [];
    if (editorJson?.content) {
      for (const node of editorJson.content) {
        if (node.type === "widgetBlock" && node.attrs) {
          widgets.push({
            type: node.attrs.widgetType,
            title: node.attrs.widgetTitle,
            data: JSON.parse(node.attrs.widgetData || "{}"),
          });
        }
      }
    }
    onResultChange?.({ ...result, markdown, widgets, editorJson });
  }

  // ─── Widget creation flow: type select → edit modal → insert ──

  function handleWidgetTypeSelected(type: string) {
    const label = WIDGET_TYPES.find((w) => w.type === type)?.label || "";
    const data = getDefaultData(type);
    setShowTypeSelector(false);
    setPendingWidget({ type, title: label, data });
  }

  function handlePendingWidgetChange(updated: WidgetData) {
    setPendingWidget(updated);
  }

  function handlePendingWidgetClose() {
    if (pendingWidget && editorRef.current) {
      editorRef.current.chain().focus("end").insertContent({
        type: "widgetBlock",
        attrs: {
          widgetType: pendingWidget.type,
          widgetTitle: pendingWidget.title,
          widgetData: JSON.stringify(pendingWidget.data),
        },
      }).run();
    }
    setPendingWidget(null);
  }

  return (
    <div>
      <RichTextEditor
        content={result.markdown}
        onChange={handleMarkdownChange}
        onEditorReady={handleEditorReady}
        onInsertWidget={() => setShowTypeSelector(true)}
      />

      {/* Step 1: Type selector */}
      {showTypeSelector && (
        <TypeSelectorModal
          onSelect={handleWidgetTypeSelected}
          onClose={() => setShowTypeSelector(false)}
        />
      )}

      {/* Step 2: Edit widget data before inserting */}
      {pendingWidget && (
        <WidgetEditModal
          widget={pendingWidget}
          onChange={handlePendingWidgetChange}
          onClose={handlePendingWidgetClose}
        />
      )}
    </div>
  );
}
