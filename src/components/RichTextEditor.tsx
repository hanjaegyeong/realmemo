"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { Markdown } from "tiptap-markdown";
import { useEffect, useCallback, useRef, useState } from "react";
import { WidgetBlock } from "./WidgetBlockExtension";

// ─── Types ───────────────────────────────────────────────────────────────────

interface RichTextEditorProps {
  content: string;
  onChange?: (markdown: string) => void;
  onEditorReady?: (editor: ReturnType<typeof useEditor>) => void;
  onInsertWidget?: () => void;
  compact?: boolean;
}

// ─── Toolbar Button ──────────────────────────────────────────────────────────

function ToolbarButton({
  onAction,
  active,
  children,
  title,
}: {
  onAction: () => void;
  active?: boolean;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <div className="relative group/tip">
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          onAction();
        }}
        className={`p-1.5 rounded-md transition-colors ${
          active
            ? "bg-indigo-100 text-indigo-700"
            : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
        }`}
      >
        {children}
      </button>
      {title && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 px-2 py-1 rounded-md bg-gray-800 text-white text-[10px] whitespace-nowrap opacity-0 group-hover/tip:opacity-100 pointer-events-none transition-opacity duration-150 z-50 shadow-lg">
          {title}
        </div>
      )}
    </div>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-gray-200 mx-1" />;
}

// ─── Icons (inline SVGs, 16x16) ─────────────────────────────────────────────

const BoldIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 2.5h5a2.5 2.5 0 0 1 0 5H4zM4 7.5h6a2.5 2.5 0 0 1 0 5H4z" />
  </svg>
);

const ItalicIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="10" y1="2.5" x2="6" y2="13.5" />
    <line x1="7" y1="2.5" x2="12" y2="2.5" />
    <line x1="4" y1="13.5" x2="9" y2="13.5" />
  </svg>
);

const UnderlineIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 2.5v5a4 4 0 0 0 8 0v-5" />
    <line x1="3" y1="14" x2="13" y2="14" />
  </svg>
);

const StrikethroughIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5.5 3.5A2.5 2.5 0 0 1 8 2c1.6 0 3 .9 3 2.5 0 .8-.4 1.4-1 1.8" />
    <path d="M10.5 12.5A2.5 2.5 0 0 1 8 14c-1.6 0-3-.9-3-2.5 0-.8.4-1.4 1-1.8" />
    <line x1="2" y1="8" x2="14" y2="8" />
  </svg>
);

const BulletListIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="3" cy="4" r="1" fill="currentColor" stroke="none" />
    <circle cx="3" cy="8" r="1" fill="currentColor" stroke="none" />
    <circle cx="3" cy="12" r="1" fill="currentColor" stroke="none" />
    <line x1="6.5" y1="4" x2="14" y2="4" />
    <line x1="6.5" y1="8" x2="14" y2="8" />
    <line x1="6.5" y1="12" x2="14" y2="12" />
  </svg>
);

const OrderedListIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <text x="1.5" y="5.5" fontSize="5" fill="currentColor" stroke="none" fontFamily="sans-serif">1</text>
    <text x="1.5" y="9.5" fontSize="5" fill="currentColor" stroke="none" fontFamily="sans-serif">2</text>
    <text x="1.5" y="13.5" fontSize="5" fill="currentColor" stroke="none" fontFamily="sans-serif">3</text>
    <line x1="6.5" y1="4" x2="14" y2="4" />
    <line x1="6.5" y1="8" x2="14" y2="8" />
    <line x1="6.5" y1="12" x2="14" y2="12" />
  </svg>
);

const TaskListIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2.5" width="4" height="4" rx="0.5" />
    <polyline points="3,4.5 4,5.5 5.5,3.5" />
    <rect x="2" y="9.5" width="4" height="4" rx="0.5" />
    <line x1="8.5" y1="4.5" x2="14" y2="4.5" />
    <line x1="8.5" y1="11.5" x2="14" y2="11.5" />
  </svg>
);

const BlockquoteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 4v8" strokeWidth="2.5" />
    <line x1="6.5" y1="5" x2="13" y2="5" />
    <line x1="6.5" y1="8" x2="13" y2="8" />
    <line x1="6.5" y1="11" x2="10" y2="11" />
  </svg>
);

const InlineCodeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="5,4 2,8 5,12" />
    <polyline points="11,4 14,8 11,12" />
    <line x1="9" y1="3" x2="7" y2="13" />
  </svg>
);

const CodeBlockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1.5" y="1.5" width="13" height="13" rx="2" />
    <polyline points="5,6 3,8 5,10" />
    <polyline points="11,6 13,8 11,10" />
    <line x1="9" y1="5" x2="7" y2="11" />
  </svg>
);

const LinkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6.5 9.5a3 3 0 0 0 4.24 0l2-2a3 3 0 0 0-4.24-4.24l-1 1" />
    <path d="M9.5 6.5a3 3 0 0 0-4.24 0l-2 2a3 3 0 0 0 4.24 4.24l1-1" />
  </svg>
);

const HorizontalRuleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="2" y1="8" x2="14" y2="8" />
    <line x1="2" y1="8" x2="2" y2="8" strokeWidth="3" strokeLinecap="round" />
    <line x1="8" y1="8" x2="8" y2="8" strokeWidth="3" strokeLinecap="round" />
    <line x1="14" y1="8" x2="14" y2="8" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

// ─── Toolbar ─────────────────────────────────────────────────────────────────

const WidgetIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1" />
    <rect x="9" y="1.5" width="5.5" height="5.5" rx="1" />
    <rect x="1.5" y="9" width="5.5" height="5.5" rx="1" />
    <rect x="9" y="9" width="5.5" height="5.5" rx="1" />
  </svg>
);

function Toolbar({ editor, onInsertWidget }: { editor: ReturnType<typeof useEditor>; onInsertWidget?: () => void }) {
  if (!editor) return null;

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes("link").href ?? "";
    const url = window.prompt("URL을 입력하세요:", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  }, [editor]);

  return (
    <div className="border-b border-gray-200 bg-gray-50/50 px-3 py-2 flex items-center flex-wrap gap-0.5">
      {/* Inline formatting */}
      <ToolbarButton
        onAction={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        title="굵게 (⌘B)"
      >
        <BoldIcon />
      </ToolbarButton>
      <ToolbarButton
        onAction={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        title="기울임 (⌘I)"
      >
        <ItalicIcon />
      </ToolbarButton>
      <ToolbarButton
        onAction={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive("underline")}
        title="밑줄 (⌘U)"
      >
        <UnderlineIcon />
      </ToolbarButton>
      <ToolbarButton
        onAction={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive("strike")}
        title="취소선 (⌘⇧S)"
      >
        <StrikethroughIcon />
      </ToolbarButton>

      <Divider />

      {/* Headings */}
      <ToolbarButton
        onAction={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={editor.isActive("heading", { level: 1 })}
        title="제목 1 (⌘⌥1)"
      >
        <span className="text-xs font-bold leading-none">H1</span>
      </ToolbarButton>
      <ToolbarButton
        onAction={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
        title="제목 2 (⌘⌥2)"
      >
        <span className="text-xs font-bold leading-none">H2</span>
      </ToolbarButton>
      <ToolbarButton
        onAction={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive("heading", { level: 3 })}
        title="제목 3 (⌘⌥3)"
      >
        <span className="text-xs font-bold leading-none">H3</span>
      </ToolbarButton>

      <Divider />

      {/* Lists */}
      <ToolbarButton
        onAction={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        title="글머리 기호 목록 (⌘⇧8)"
      >
        <BulletListIcon />
      </ToolbarButton>
      <ToolbarButton
        onAction={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        title="번호 매기기 목록 (⌘⇧7)"
      >
        <OrderedListIcon />
      </ToolbarButton>
      <ToolbarButton
        onAction={() => editor.chain().focus().toggleTaskList().run()}
        active={editor.isActive("taskList")}
        title="체크리스트 (⌘⇧9)"
      >
        <TaskListIcon />
      </ToolbarButton>

      <Divider />

      {/* Block formatting */}
      <ToolbarButton
        onAction={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
        title="인용문 (⌘⇧B)"
      >
        <BlockquoteIcon />
      </ToolbarButton>
      <ToolbarButton
        onAction={() => editor.chain().focus().toggleCode().run()}
        active={editor.isActive("code")}
        title="인라인 코드 (⌘E)"
      >
        <InlineCodeIcon />
      </ToolbarButton>
      <ToolbarButton
        onAction={() => editor.chain().focus().toggleCodeBlock().run()}
        active={editor.isActive("codeBlock")}
        title="코드 블록 (⌘⌥C)"
      >
        <CodeBlockIcon />
      </ToolbarButton>

      <Divider />

      {/* Link & HR */}
      <ToolbarButton
        onAction={setLink}
        active={editor.isActive("link")}
        title="링크 (⌘K)"
      >
        <LinkIcon />
      </ToolbarButton>
      <ToolbarButton
        onAction={() => editor.chain().focus().setHorizontalRule().run()}
        title="구분선"
      >
        <HorizontalRuleIcon />
      </ToolbarButton>

      {onInsertWidget && (
        <>
          <Divider />
          <ToolbarButton
            onAction={onInsertWidget}
            title="위젯 삽입"
          >
            <WidgetIcon />
          </ToolbarButton>
        </>
      )}
    </div>
  );
}

// ─── Editor Component ────────────────────────────────────────────────────────

export default function RichTextEditor({
  content,
  onChange,
  onEditorReady,
  onInsertWidget,
  compact = false,
}: RichTextEditorProps) {
  const lastEmittedRef = useRef(content);
  const [, setTick] = useState(0);
  const [focused, setFocused] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    onTransaction: () => {
      setTick((t) => t + 1);
    },
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-indigo-600 underline cursor-pointer",
        },
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Underline,
      WidgetBlock,
      Placeholder.configure({
        placeholder: "내용을 편집하세요...",
      }),
      Markdown.configure({
        html: false,
        transformPastedText: true,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      let md = "";
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        md = (editor.storage as any).markdown.getMarkdown();
      } catch {
        md = editor.getText();
      }
      lastEmittedRef.current = md;
      onChange?.(md);
    },
    editorProps: {
      attributes: {
        class: `prose max-w-none focus:outline-none ${compact ? "min-h-[60px]" : "min-h-[300px]"} px-6 py-4 text-[15px] leading-relaxed text-gray-900`,
      },
    },
  });

  // Expose editor instance to parent
  useEffect(() => {
    if (editor) onEditorReady?.(editor);
  }, [editor, onEditorReady]);

  // Only apply external content changes (AI transform, doc switch).
  // Skip if the content matches what we last emitted (our own edit echo).
  useEffect(() => {
    if (!editor) return;
    if (content === lastEmittedRef.current) return;
    lastEmittedRef.current = content;
    editor.commands.setContent(content);
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className={`rounded-xl bg-white overflow-hidden transition-colors ${focused ? "ring-1 ring-indigo-200" : ""}`}>
      {focused && <Toolbar editor={editor} onInsertWidget={onInsertWidget} />}
      <EditorContent editor={editor} />
    </div>
  );
}
