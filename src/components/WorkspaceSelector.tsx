"use client";

import { useState, useRef, useEffect } from "react";
import type { Workspace } from "@/lib/store";

// ─── Props ──────────────────────────────────────────────────────────────────

export interface WorkspaceSelectorProps {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  onSelect: (workspace: Workspace) => void;
  onCreate: (name: string, emoji: string, color: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: { name?: string; emoji?: string; color?: string }) => void;
  onClose: () => void;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const COLOR_MAP: Record<string, { bg: string; bgLight: string; text: string }> = {
  gray:    { bg: "bg-gray-500",    bgLight: "bg-gray-100",    text: "text-gray-600" },
  indigo:  { bg: "bg-indigo-500",  bgLight: "bg-indigo-100",  text: "text-indigo-600" },
  rose:    { bg: "bg-rose-500",    bgLight: "bg-rose-100",    text: "text-rose-600" },
  emerald: { bg: "bg-emerald-500", bgLight: "bg-emerald-100", text: "text-emerald-600" },
  amber:   { bg: "bg-amber-500",   bgLight: "bg-amber-100",   text: "text-amber-600" },
  violet:  { bg: "bg-violet-500",  bgLight: "bg-violet-100",  text: "text-violet-600" },
  cyan:    { bg: "bg-cyan-500",    bgLight: "bg-cyan-100",    text: "text-cyan-600" },
};

function getColorClasses(color: string) {
  return COLOR_MAP[color] ?? COLOR_MAP.gray;
}

/** 워크스페이스 이니셜 아이콘 — 이름 첫 글자 + 컬러 배경 */
function WorkspaceIcon({ name, color, size = "sm" }: { name: string; color: string; size?: "sm" | "md" }) {
  const c = getColorClasses(color);
  const initial = name.charAt(0).toUpperCase() || "W";
  const sizeClass = size === "md" ? "w-8 h-8 text-sm" : "w-5 h-5 text-[11px]";
  return (
    <span className={`${sizeClass} ${c.bgLight} ${c.text} rounded-md flex items-center justify-center font-semibold flex-shrink-0 select-none`}>
      {initial}
    </span>
  );
}

const COLOR_KEYS = Object.keys(COLOR_MAP).filter((k) => k !== "gray");

// ─── Icons ──────────────────────────────────────────────────────────────────

function CheckIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
    </svg>
  );
}

// ─── Create Form Modal ───────────────────────────────────────────────────────

function CreateForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (name: string, emoji: string, color: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLOR_KEYS[0]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onSubmit(trimmed, trimmed.charAt(0).toUpperCase() || "W", color);
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/25 backdrop-blur-[2px]">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm mx-4 rounded-xl bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_8px_32px_rgba(0,0,0,0.12)] border border-black/[0.06]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[13px] font-semibold text-gray-900">새 워크스페이스</h3>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-black/[0.04] transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Name + Preview */}
        <label className="block mb-3.5">
          <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-1.5 block">이름</span>
          <div className="flex items-center gap-2.5">
            <WorkspaceIcon name={name || "W"} color={color} size="md" />
            <input
              ref={inputRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="워크스페이스 이름"
              className="flex-1 min-w-0 rounded-lg border border-black/[0.1] px-3 py-1.5 text-[13px] outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-colors placeholder:text-gray-400"
            />
          </div>
        </label>

        {/* Color */}
        <div className="mb-5">
          <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-1.5 block">색상</span>
          <div className="flex gap-2.5">
            {COLOR_KEYS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full ${COLOR_MAP[c].bg} transition-all duration-100 ${
                  color === c
                    ? "ring-2 ring-offset-2 ring-gray-400 scale-110"
                    : "hover:scale-110"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 rounded-lg text-[13px] text-gray-600 hover:bg-black/[0.04] transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={!name.trim()}
            className="px-3 py-1.5 rounded-lg text-[13px] font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            만들기
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Workspace Row ───────────────────────────────────────────────────────────

function WorkspaceRow({
  workspace,
  isActive,
  onSelect,
}: {
  workspace: Workspace;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      className="flex items-center gap-2.5 px-3 py-[7px] mx-1 rounded-lg hover:bg-black/[0.03] cursor-pointer transition-colors"
      onClick={onSelect}
    >
      <WorkspaceIcon name={workspace.name} color={workspace.color} />
      <span className="flex-1 min-w-0 truncate text-[13px] font-medium text-gray-800">
        {workspace.name}
      </span>
      {isActive && <CheckIcon />}
    </div>
  );
}

// ─── Main Component (Dropdown Popover) ──────────────────────────────────────

export default function WorkspaceSelector({
  workspaces,
  activeWorkspaceId,
  onSelect,
  onCreate,
  onDelete,
  onUpdate,
  onClose,
}: WorkspaceSelectorProps) {
  const [showCreate, setShowCreate] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click (skip when create form is open)
  useEffect(() => {
    if (showCreate) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose, showCreate]);

  function handleCreate(name: string, emoji: string, color: string) {
    onCreate(name, emoji, color);
    setShowCreate(false);
  }

  return (
    <>
      <div
        ref={ref}
        className="absolute left-0 top-full mt-1 z-[100] w-72 rounded-xl bg-white py-1 shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_3px_6px_rgba(0,0,0,0.04),0_9px_24px_rgba(0,0,0,0.06)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 pt-2.5 pb-1.5">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">워크스페이스</p>
        </div>

        {/* Divider */}
        <div className="mx-3 mb-1 border-t border-black/[0.05]" />

        {/* Workspace list */}
        <div className="py-0.5">
          {workspaces.map((ws) => (
            <WorkspaceRow
              key={ws.id}
              workspace={ws}
              isActive={activeWorkspaceId === ws.id}
              onSelect={() => { onSelect(ws); onClose(); }}
            />
          ))}
          {workspaces.length === 0 && (
            <p className="px-4 py-3 text-[12px] text-gray-400 text-center">
              워크스페이스가 없습니다
            </p>
          )}
        </div>

        {/* Divider */}
        <div className="mx-3 my-1 border-t border-black/[0.05]" />

        {/* Create */}
        <button
          onClick={() => setShowCreate(true)}
          className="w-full flex items-center gap-2.5 px-4 py-[7px] mx-0 text-[13px] text-gray-500 hover:bg-black/[0.03] transition-colors"
        >
          <PlusIcon />
          새 워크스페이스 만들기
        </button>

        {/* Divider */}
        <div className="mx-3 my-1 border-t border-black/[0.05]" />

        {/* Manage link */}
        <a
          href="/workspaces"
          className="w-full flex items-center gap-2.5 px-4 py-[7px] text-[13px] text-gray-500 hover:bg-black/[0.03] transition-colors"
        >
          <GearIcon />
          워크스페이스 관리
        </a>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <CreateForm
          onSubmit={handleCreate}
          onCancel={() => setShowCreate(false)}
        />
      )}
    </>
  );
}
