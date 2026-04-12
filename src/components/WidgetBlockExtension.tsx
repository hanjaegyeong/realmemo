"use client";

import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import { useState } from "react";
import WidgetRenderer from "./Widgets";
import { WidgetEditModal } from "./WidgetManager";

// ─── React Node View ────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function WidgetBlockComponent(props: any) {
  const { node, updateAttributes, deleteNode, selected } = props;
  const [editing, setEditing] = useState(false);

  const widget = {
    type: node.attrs.widgetType,
    title: node.attrs.widgetTitle,
    data: JSON.parse(node.attrs.widgetData || "{}"),
  };

  function handleWidgetChange(updated: { type: string; title: string; data: Record<string, unknown> }) {
    updateAttributes({
      widgetTitle: updated.title,
      widgetData: JSON.stringify(updated.data),
    });
  }

  return (
    <NodeViewWrapper className="my-3 not-prose" data-widget-block contentEditable={false}>
      <div
        className={`group/widget relative rounded-xl border bg-white p-6 transition text-base font-normal ${
          selected ? "border-indigo-300 shadow-sm" : "border-black/[0.06] hover:shadow-sm"
        }`}
      >
        {/* Drag handle */}
        <div
          className="absolute top-1/2 -left-7 -translate-y-1/2 cursor-grab active:cursor-grabbing p-1 rounded text-gray-300 hover:text-gray-500 opacity-0 group-hover/widget:opacity-100 transition"
          data-drag-handle
        >
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="5" cy="3" r="1.2" />
            <circle cx="11" cy="3" r="1.2" />
            <circle cx="5" cy="8" r="1.2" />
            <circle cx="11" cy="8" r="1.2" />
            <circle cx="5" cy="13" r="1.2" />
            <circle cx="11" cy="13" r="1.2" />
          </svg>
        </div>

        {/* Controls */}
        <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover/widget:opacity-100 transition z-10">
          <button
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onClick={(e) => { e.stopPropagation(); setEditing(true); }}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-indigo-50 hover:text-indigo-500 transition"
            title="편집"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm("이 위젯을 삭제하시겠습니까?")) deleteNode();
            }}
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

      {editing && (
        <WidgetEditModal
          widget={widget}
          onChange={handleWidgetChange}
          onClose={() => setEditing(false)}
        />
      )}
    </NodeViewWrapper>
  );
}

// ─── TipTap Extension ───────────────────────────────────────────────────────

export const WidgetBlock = Node.create({
  name: "widgetBlock",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      widgetType: { default: "" },
      widgetTitle: { default: "" },
      widgetData: { default: "{}" },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-widget-block]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-widget-block": "" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(WidgetBlockComponent);
  },
});
