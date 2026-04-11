"use client";

import { useState, useEffect, useRef } from "react";
import {
  type Workspace,
  getWorkspaces,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  getActiveWorkspaceId,
  setActiveWorkspaceId,
  migrateFromHistory,
  migrateToWorkspaces,
  getDocuments,
  getFolders,
} from "@/lib/store";

// ─── Color map ──────────────────────────────────────────────────────────────

const COLOR_MAP: Record<string, { bgLight: string; text: string; border: string; ring: string; bg: string }> = {
  gray:    { bgLight: "bg-gray-100",    text: "text-gray-600",    border: "border-gray-200",    ring: "ring-gray-300",    bg: "bg-gray-500" },
  indigo:  { bgLight: "bg-indigo-100",  text: "text-indigo-600",  border: "border-indigo-200",  ring: "ring-indigo-300",  bg: "bg-indigo-500" },
  rose:    { bgLight: "bg-rose-100",    text: "text-rose-600",    border: "border-rose-200",    ring: "ring-rose-300",    bg: "bg-rose-500" },
  emerald: { bgLight: "bg-emerald-100", text: "text-emerald-600", border: "border-emerald-200", ring: "ring-emerald-300", bg: "bg-emerald-500" },
  amber:   { bgLight: "bg-amber-100",   text: "text-amber-600",   border: "border-amber-200",   ring: "ring-amber-300",   bg: "bg-amber-500" },
  violet:  { bgLight: "bg-violet-100",  text: "text-violet-600",  border: "border-violet-200",  ring: "ring-violet-300",  bg: "bg-violet-500" },
  cyan:    { bgLight: "bg-cyan-100",    text: "text-cyan-600",    border: "border-cyan-200",    ring: "ring-cyan-300",    bg: "bg-cyan-500" },
};

const COLOR_KEYS = Object.keys(COLOR_MAP).filter((k) => k !== "gray");

function getColor(color: string) {
  return COLOR_MAP[color] ?? COLOR_MAP.gray;
}

// ─── Workspace Initial Icon ─────────────────────────────────────────────────

function WsIcon({ name, color, size = "lg" }: { name: string; color: string; size?: "sm" | "lg" }) {
  const c = getColor(color);
  const initial = name.charAt(0).toUpperCase() || "W";
  const cls = size === "lg"
    ? "w-12 h-12 text-xl rounded-xl"
    : "w-6 h-6 text-xs rounded-md";
  return (
    <span className={`${cls} ${c.bgLight} ${c.text} flex items-center justify-center font-bold flex-shrink-0 select-none`}>
      {initial}
    </span>
  );
}

// ─── Create Modal ───────────────────────────────────────────────────────────

function CreateModal({ onSubmit, onCancel }: {
  onSubmit: (name: string, color: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("indigo");
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => { ref.current?.focus(); }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onSubmit(trimmed, color);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm" onClick={onCancel}>
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm mx-4 rounded-xl bg-white p-6 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_8px_32px_rgba(0,0,0,0.12)]"
      >
        <h3 className="text-base font-semibold text-gray-900 mb-5">새 워크스페이스</h3>

        {/* Preview + Name */}
        <div className="mb-5">
          <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-2 block">이름</label>
          <div className="flex items-center gap-3">
            <WsIcon name={name || "W"} color={color} />
            <input
              ref={ref}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="워크스페이스 이름"
              className="flex-1 min-w-0 rounded-lg border border-black/[0.1] px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-colors placeholder:text-gray-300"
            />
          </div>
        </div>

        {/* Color */}
        <div className="mb-6">
          <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-2 block">색상</label>
          <div className="flex gap-2.5">
            {COLOR_KEYS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full ${COLOR_MAP[c].bg} transition-all duration-100 ${
                  color === c ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : "hover:scale-110"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition-colors">
            취소
          </button>
          <button
            type="submit"
            disabled={!name.trim()}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            만들기
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Workspace Card ─────────────────────────────────────────────────────────

function WorkspaceCard({ workspace, isActive, memoCount, folderCount, onSelect, onRename, onDelete }: {
  workspace: Workspace;
  isActive: boolean;
  memoCount: number;
  folderCount: number;
  onSelect: () => void;
  onRename: (name: string) => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(workspace.name);
  const renameRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const c = getColor(workspace.color);

  useEffect(() => {
    if (renaming) { renameRef.current?.focus(); renameRef.current?.select(); }
  }, [renaming]);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  function handleRenameSubmit() {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== workspace.name) onRename(trimmed);
    setRenaming(false);
  }

  function handleDelete() {
    setMenuOpen(false);
    if (window.confirm("이 워크스페이스를 삭제할까요?\n포함된 모든 메모와 폴더가 삭제됩니다.")) onDelete();
  }

  const date = new Date(workspace.createdAt);
  const dateStr = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;

  return (
    <div
      onClick={() => { if (!renaming) onSelect(); }}
      className={`group relative rounded-xl border bg-white p-5 cursor-pointer transition-all duration-150 hover:shadow-md hover:scale-[1.01] ${
        isActive ? `${c.border} ring-2 ring-offset-1 ${c.ring}` : "border-black/[0.06] hover:border-black/[0.12]"
      }`}
    >
      {/* Menu */}
      <div ref={menuRef} className="absolute top-3 right-3">
        <button
          onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
          className={`p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-black/[0.04] transition-all ${
            menuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <circle cx="4" cy="10" r="1.5" /><circle cx="10" cy="10" r="1.5" /><circle cx="16" cy="10" r="1.5" />
          </svg>
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-full mt-1 z-50 w-36 rounded-xl bg-white py-1.5 shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_3px_6px_rgba(0,0,0,0.04),0_9px_24px_rgba(0,0,0,0.06)]">
            <button
              className="w-full text-left px-3 py-1.5 text-[13px] text-gray-700 hover:bg-black/[0.03] transition-colors"
              onClick={(e) => { e.stopPropagation(); setMenuOpen(false); setRenameValue(workspace.name); setRenaming(true); }}
            >
              이름 변경
            </button>
            <button
              className="w-full text-left px-3 py-1.5 text-[13px] text-red-500 hover:bg-black/[0.03] transition-colors"
              onClick={(e) => { e.stopPropagation(); handleDelete(); }}
            >
              삭제
            </button>
          </div>
        )}
      </div>

      {/* Icon */}
      <div className="mb-4">
        <WsIcon name={workspace.name} color={workspace.color} />
      </div>

      {/* Name */}
      {renaming ? (
        <input
          ref={renameRef}
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          onBlur={handleRenameSubmit}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); handleRenameSubmit(); }
            if (e.key === "Escape") { e.preventDefault(); setRenaming(false); }
          }}
          onClick={(e) => e.stopPropagation()}
          className="w-full rounded-lg border border-indigo-400 px-2 py-1 text-sm font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-100 bg-white"
        />
      ) : (
        <h3 className="text-sm font-semibold text-gray-900 truncate mb-1">{workspace.name}</h3>
      )}

      {/* Meta */}
      <div className="flex items-center gap-3 text-[12px] text-gray-400">
        <span>{memoCount}개 메모</span>
        {folderCount > 0 && <span>{folderCount}개 폴더</span>}
      </div>
      <p className="text-[11px] text-gray-300 mt-2">{dateStr}</p>

      {/* Active badge */}
      {isActive && (
        <div className={`absolute top-3 left-3 px-1.5 py-0.5 rounded text-[10px] font-medium ${c.bgLight} ${c.text}`}>
          현재
        </div>
      )}
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Per-workspace counts
  const [memoCounts, setMemoCounts] = useState<Record<string, number>>({});
  const [folderCounts, setFolderCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    migrateFromHistory();
    migrateToWorkspaces();
    refreshAll();
    setMounted(true);
  }, []);

  function refreshAll() {
    const ws = getWorkspaces();
    setWorkspaces(ws);
    setActiveId(getActiveWorkspaceId());

    const docs = getDocuments();
    const folders = getFolders();
    const mc: Record<string, number> = {};
    const fc: Record<string, number> = {};
    for (const w of ws) { mc[w.id] = 0; fc[w.id] = 0; }
    for (const d of docs) { if (mc[d.workspaceId] !== undefined) mc[d.workspaceId]++; }
    for (const f of folders) { if (fc[f.workspaceId] !== undefined) fc[f.workspaceId]++; }
    setMemoCounts(mc);
    setFolderCounts(fc);
  }

  function handleSelect(ws: Workspace) {
    setActiveWorkspaceId(ws.id);
    setActiveId(ws.id);
    window.location.href = "/";
  }

  function handleCreate(name: string, color: string) {
    const ws = createWorkspace(name, name.charAt(0).toUpperCase(), color);
    setShowCreate(false);
    setActiveWorkspaceId(ws.id);
    setActiveId(ws.id);
    refreshAll();
  }

  function handleRename(id: string, name: string) {
    updateWorkspace(id, { name });
    refreshAll();
  }

  function handleDelete(id: string) {
    deleteWorkspace(id);
    const remaining = getWorkspaces();
    if (activeId === id && remaining.length > 0) {
      setActiveWorkspaceId(remaining[0].id);
      setActiveId(remaining[0].id);
    }
    refreshAll();
  }

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-black/[0.06] bg-white/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="mx-auto max-w-4xl px-6 py-3 flex items-center justify-between">
          <a href="/" className="text-base font-semibold text-gray-900 tracking-tight hover:opacity-70 transition-opacity">
            <span className="text-indigo-600">Real</span>Memo
          </a>
          <a href="/" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
            메인으로
          </a>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-6 py-10">
        {/* Title + Action */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 tracking-tight">워크스페이스</h1>
            <p className="text-sm text-gray-400 mt-1">워크스페이스별로 메모와 폴더를 독립적으로 관리할 수 있습니다</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
            </svg>
            새 워크스페이스
          </button>
        </div>

        {/* Cards */}
        {workspaces.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {workspaces.map((ws) => (
              <WorkspaceCard
                key={ws.id}
                workspace={ws}
                isActive={activeId === ws.id}
                memoCount={memoCounts[ws.id] ?? 0}
                folderCount={folderCounts[ws.id] ?? 0}
                onSelect={() => handleSelect(ws)}
                onRename={(name) => handleRename(ws.id, name)}
                onDelete={() => handleDelete(ws.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-5">
              <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1.5">워크스페이스가 없습니다</h3>
            <p className="text-sm text-gray-400 mb-6">첫 번째 워크스페이스를 만들어보세요</p>
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors shadow-sm"
            >
              워크스페이스 만들기
            </button>
          </div>
        )}
      </main>

      {/* Create Modal */}
      {showCreate && (
        <CreateModal
          onSubmit={handleCreate}
          onCancel={() => setShowCreate(false)}
        />
      )}
    </div>
  );
}
