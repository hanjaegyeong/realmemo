"use client";

import { useState, useRef, useEffect } from "react";
import type { FolderTreeNode, MemoDocument, Folder, Workspace } from "@/lib/store";
import WorkspaceSelector from "./WorkspaceSelector";

export interface SidebarProps {
  tree: FolderTreeNode[];
  rootDocuments: MemoDocument[];
  selectedDocId: string | null;
  selectedFolderId: string | null;
  autoRenameId: string | null;
  onAutoRenameDone: () => void;
  onSelectDocument: (doc: MemoDocument) => void;
  onSelectFolder: (folderId: string | null) => void;
  onNewMemo: () => void;
  onNewMemoInFolder: (folderId: string) => void;
  onCreateFolder: (name: string, parentId: string | null) => void;
  onRenameFolder: (id: string, name: string) => void;
  onDeleteFolder: (id: string) => void;
  onRenameDocument: (id: string, name: string) => void;
  onDeleteDocument: (id: string) => void;
  onMoveDocument: (docId: string, folderId: string | null) => void;
  onMoveFolder: (folderId: string, newParentId: string | null) => void;
  // Workspace props
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  onSelectWorkspace: (ws: Workspace) => void;
  onCreateWorkspace: (name: string, emoji: string, color: string) => void;
  onDeleteWorkspace: (id: string) => void;
  onUpdateWorkspace: (id: string, updates: { name?: string; emoji?: string; color?: string }) => void;
}

// ─── Color map (shared with WorkspaceSelector) ─────────────────────────────

const WS_COLOR_MAP: Record<string, { bgLight: string; text: string }> = {
  gray:    { bgLight: "bg-gray-100",    text: "text-gray-600" },
  indigo:  { bgLight: "bg-indigo-100",  text: "text-indigo-600" },
  rose:    { bgLight: "bg-rose-100",    text: "text-rose-600" },
  emerald: { bgLight: "bg-emerald-100", text: "text-emerald-600" },
  amber:   { bgLight: "bg-amber-100",   text: "text-amber-600" },
  violet:  { bgLight: "bg-violet-100",  text: "text-violet-600" },
  cyan:    { bgLight: "bg-cyan-100",    text: "text-cyan-600" },
};

function WorkspaceInitial({ name, color }: { name: string; color: string }) {
  const c = WS_COLOR_MAP[color] ?? WS_COLOR_MAP.gray;
  const initial = name.charAt(0).toUpperCase() || "W";
  return (
    <span className={`w-5 h-5 ${c.bgLight} ${c.text} rounded-md flex items-center justify-center text-[11px] font-semibold flex-shrink-0 select-none`}>
      {initial}
    </span>
  );
}

// ─── Icons ───────────────────────────────────────────────────────────────────

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-3 h-3 text-gray-400 transition-transform duration-150 flex-shrink-0 ${open ? "rotate-90" : ""}`}
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
    </svg>
  );
}

function SwitcherChevronIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg className="w-[15px] h-[15px] text-gray-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
      <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg className="w-[15px] h-[15px] text-gray-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
    </svg>
  );
}

function DotsIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
      <circle cx="10" cy="4" r="1.5" />
      <circle cx="10" cy="10" r="1.5" />
      <circle cx="10" cy="16" r="1.5" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="w-[15px] h-[15px] text-gray-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
    </svg>
  );
}

// ─── Inline Input ────────────────────────────────────────────────────────────

function InlineInput({
  defaultValue,
  placeholder,
  onSubmit,
  onCancel,
}: {
  defaultValue?: string;
  placeholder?: string;
  onSubmit: (value: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(defaultValue ?? "");
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ref.current?.focus();
    ref.current?.select();
  }, []);

  function commit() {
    const trimmed = value.trim();
    if (trimmed) onSubmit(trimmed);
    else onCancel();
  }

  return (
    <input
      ref={ref}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") { e.preventDefault(); commit(); }
        if (e.key === "Escape") { e.preventDefault(); onCancel(); }
      }}
      placeholder={placeholder}
      className="flex-1 min-w-0 rounded-md px-1.5 py-0.5 text-[13px] border border-indigo-400 outline-none bg-white text-gray-900 focus:ring-1 focus:ring-indigo-200"
      onClick={(e) => e.stopPropagation()}
    />
  );
}

// ─── Context Menu ────────────────────────────────────────────────────────────

interface MenuItem { label: string; danger?: boolean; onClick: () => void; }
interface MenuWithSubmenu { label: string; submenu: MenuItem[]; }
type MenuEntry = MenuItem | MenuWithSubmenu;

function isSubmenu(e: MenuEntry): e is MenuWithSubmenu { return "submenu" in e; }

function ContextMenu({ items, onClose }: { items: MenuEntry[]; onClose: () => void }) {
  const [openSub, setOpenSub] = useState<string | null>(null);

  return (
    <div
      className="absolute right-0 top-full mt-1 z-50 w-48 rounded-xl bg-white py-1.5 text-[13px] shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_3px_6px_rgba(0,0,0,0.04),0_9px_24px_rgba(0,0,0,0.06)]"
      onClick={(e) => e.stopPropagation()}
    >
      {items.map((item, i) =>
        isSubmenu(item) ? (
          <div key={i}>
            <button
              className="w-full text-left px-3 py-1.5 text-gray-700 hover:bg-black/[0.03] flex items-center justify-between transition-colors"
              onClick={() => setOpenSub(openSub === item.label ? null : item.label)}
            >
              {item.label}
              <svg className="w-3 h-3 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
              </svg>
            </button>
            {openSub === item.label && (
              <div className="border-t border-black/[0.04] bg-black/[0.02] py-1 max-h-48 overflow-y-auto">
                {item.submenu.map((sub, j) => (
                  <button
                    key={j}
                    className="w-full text-left px-4 py-1.5 text-[12px] text-gray-600 hover:bg-black/[0.03] transition-colors"
                    onClick={() => { sub.onClick(); onClose(); }}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <button
            key={i}
            className={`w-full text-left px-3 py-1.5 hover:bg-black/[0.03] transition-colors ${item.danger ? "text-red-500" : "text-gray-700"}`}
            onClick={() => { item.onClick(); onClose(); }}
          >
            {item.label}
          </button>
        )
      )}
    </div>
  );
}

// ─── Drag helpers ────────────────────────────────────────────────────────────

const DRAG_DOC = "application/x-realmemo-doc";
const DRAG_FOLDER = "application/x-realmemo-folder";

function startDocDrag(e: React.DragEvent, docId: string) {
  e.dataTransfer.setData(DRAG_DOC, docId);
  e.dataTransfer.effectAllowed = "move";
}

function startFolderDrag(e: React.DragEvent, folderId: string) {
  e.dataTransfer.setData(DRAG_FOLDER, folderId);
  e.dataTransfer.effectAllowed = "move";
}

function getDragDocId(e: React.DragEvent): string | null {
  return e.dataTransfer.types.includes(DRAG_DOC) ? e.dataTransfer.getData(DRAG_DOC) : null;
}

function getDragFolderId(e: React.DragEvent): string | null {
  return e.dataTransfer.types.includes(DRAG_FOLDER) ? e.dataTransfer.getData(DRAG_FOLDER) : null;
}

function canDrop(e: React.DragEvent): boolean {
  return e.dataTransfer.types.includes(DRAG_DOC) || e.dataTransfer.types.includes(DRAG_FOLDER);
}

// ─── DocRow ──────────────────────────────────────────────────────────────────

function DocRow({
  doc, depth, selected, isMenuOpen, isRenaming, allFolders,
  onSelect, onOpenMenu, onStartRename, onCancelRename, onRename, onDelete, onMove,
}: {
  doc: MemoDocument; depth: number; selected: boolean;
  isMenuOpen: boolean; isRenaming: boolean; allFolders: Folder[];
  onSelect: () => void; onOpenMenu: () => void;
  onStartRename: () => void; onCancelRename: () => void;
  onRename: (name: string) => void; onDelete: () => void;
  onMove: (folderId: string | null) => void;
}) {
  const moveItems: MenuItem[] = [
    { label: "미분류 (루트)", onClick: () => onMove(null) },
    ...allFolders.filter((f) => f.id !== doc.folderId).map((f) => ({
      label: f.name, onClick: () => onMove(f.id),
    })),
  ];

  const menuItems: MenuEntry[] = [
    { label: "이름 변경", onClick: onStartRename },
    { label: "폴더 이동", submenu: moveItems },
    { label: "삭제", danger: true, onClick: onDelete },
  ];

  return (
    <div
      draggable={!isRenaming}
      onDragStart={(e) => startDocDrag(e, doc.id)}
      className={`group flex items-center gap-1.5 pr-1.5 py-[5px] rounded-md cursor-pointer transition-colors relative ${
        selected
          ? "bg-indigo-500/[0.08] text-indigo-700"
          : "text-gray-600 hover:bg-black/[0.04]"
      }`}
      style={{ paddingLeft: `${depth * 16 + 8}px` }}
      onClick={onSelect}
    >
      <DocIcon />
      {isRenaming ? (
        <InlineInput defaultValue={doc.title} onSubmit={onRename} onCancel={onCancelRename} />
      ) : (
        <span className="flex-1 min-w-0 truncate text-[13px]">{doc.title}</span>
      )}
      <button
        className={`flex-shrink-0 p-0.5 rounded text-gray-400 hover:text-gray-600 hover:bg-black/[0.06] transition-all ${
          isMenuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
        onClick={(e) => { e.stopPropagation(); onOpenMenu(); }}
      >
        <DotsIcon />
      </button>
      {isMenuOpen && <ContextMenu items={menuItems} onClose={onOpenMenu} />}
    </div>
  );
}

// ─── FolderRow (recursive) ───────────────────────────────────────────────────

function FolderRow({
  node, depth, selectedDocId, selectedFolderId,
  activeMenuId, renamingId, newSubfolderParentId, allFolders,
  onSelectDocument, onSelectFolder, onSetActiveMenu,
  onStartRename, onCancelRename, onRenameFolder, onDeleteFolder,
  onStartNewSubfolder, onCancelNewSubfolder, onCreateSubfolder,
  onNewMemoInFolder, onRenameDocument, onDeleteDocument, onMoveDocument, onMoveFolder,
}: {
  node: FolderTreeNode; depth: number;
  selectedDocId: string | null; selectedFolderId: string | null;
  activeMenuId: string | null; renamingId: string | null;
  newSubfolderParentId: string | null; allFolders: Folder[];
  onSelectDocument: (doc: MemoDocument) => void;
  onSelectFolder: (folderId: string) => void;
  onSetActiveMenu: (id: string | null) => void;
  onStartRename: (id: string) => void;
  onCancelRename: () => void;
  onRenameFolder: (id: string, name: string) => void;
  onDeleteFolder: (id: string) => void;
  onStartNewSubfolder: (parentId: string) => void;
  onCancelNewSubfolder: () => void;
  onCreateSubfolder: (name: string, parentId: string) => void;
  onNewMemoInFolder: (folderId: string) => void;
  onRenameDocument: (id: string, name: string) => void;
  onDeleteDocument: (id: string) => void;
  onMoveDocument: (docId: string, folderId: string | null) => void;
  onMoveFolder: (folderId: string, newParentId: string | null) => void;
}) {
  const [open, setOpen] = useState(true);
  const [dragOver, setDragOver] = useState(false);

  const fid = node.folder.id;
  const isSelected = selectedFolderId === fid;
  const isMenuOpen = activeMenuId === `folder-${fid}`;
  const isRenaming = renamingId === `folder-${fid}`;
  const showNewSubfolder = newSubfolderParentId === fid;

  useEffect(() => {
    if (showNewSubfolder) setOpen(true);
  }, [showNewSubfolder]);

  const hasChildren = node.children.length > 0 || node.documents.length > 0 || showNewSubfolder;

  const menuItems: MenuEntry[] = [
    { label: "이름 변경", onClick: () => onStartRename(`folder-${fid}`) },
    { label: "하위 폴더 추가", onClick: () => onStartNewSubfolder(fid) },
    { label: "새 메모", onClick: () => onNewMemoInFolder(fid) },
    { label: "삭제", danger: true, onClick: () => onDeleteFolder(fid) },
  ];

  function handleDragOver(e: React.DragEvent) {
    if (!canDrop(e)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOver(true);
  }

  function handleDragLeave() {
    setDragOver(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const docId = getDragDocId(e);
    if (docId) { onMoveDocument(docId, fid); setOpen(true); return; }
    const draggedFolderId = getDragFolderId(e);
    if (draggedFolderId && draggedFolderId !== fid) { onMoveFolder(draggedFolderId, fid); setOpen(true); }
  }

  return (
    <div>
      {/* Folder header */}
      <div
        draggable={!isRenaming}
        onDragStart={(e) => { e.stopPropagation(); startFolderDrag(e, fid); }}
        className={`group flex items-center gap-1.5 pr-1.5 py-[5px] rounded-md cursor-pointer transition-colors relative ${
          dragOver
            ? "bg-indigo-500/[0.08] ring-1 ring-indigo-300"
            : isSelected
              ? "bg-indigo-500/[0.08] text-indigo-700"
              : "text-gray-700 hover:bg-black/[0.04]"
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => { setOpen((v) => !v); onSelectFolder(fid); }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <ChevronIcon open={open} />
        <FolderIcon />
        {isRenaming ? (
          <InlineInput
            defaultValue={node.folder.name}
            onSubmit={(name) => onRenameFolder(fid, name)}
            onCancel={onCancelRename}
          />
        ) : (
          <span className="flex-1 min-w-0 truncate text-[13px] font-medium">{node.folder.name}</span>
        )}
        <button
          className={`flex-shrink-0 p-0.5 rounded text-gray-400 hover:text-gray-600 hover:bg-black/[0.06] transition-all ${
            isMenuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
          onClick={(e) => { e.stopPropagation(); onSetActiveMenu(isMenuOpen ? null : `folder-${fid}`); }}
        >
          <DotsIcon />
        </button>
        {isMenuOpen && <ContextMenu items={menuItems} onClose={() => onSetActiveMenu(null)} />}
      </div>

      {/* Children */}
      {open && hasChildren && (
        <div>
          {showNewSubfolder && (
            <div className="flex items-center gap-1.5 pr-1.5 py-[5px]" style={{ paddingLeft: `${(depth + 1) * 16 + 8}px` }}>
              <FolderIcon />
              <InlineInput
                placeholder="폴더 이름"
                onSubmit={(name) => onCreateSubfolder(name, fid)}
                onCancel={onCancelNewSubfolder}
              />
            </div>
          )}

          {node.children.map((child) => (
            <FolderRow
              key={child.folder.id} node={child} depth={depth + 1}
              selectedDocId={selectedDocId} selectedFolderId={selectedFolderId}
              activeMenuId={activeMenuId} renamingId={renamingId}
              newSubfolderParentId={newSubfolderParentId} allFolders={allFolders}
              onSelectDocument={onSelectDocument} onSelectFolder={onSelectFolder}
              onSetActiveMenu={onSetActiveMenu} onStartRename={onStartRename}
              onCancelRename={onCancelRename} onRenameFolder={onRenameFolder}
              onDeleteFolder={onDeleteFolder} onStartNewSubfolder={onStartNewSubfolder}
              onCancelNewSubfolder={onCancelNewSubfolder} onCreateSubfolder={onCreateSubfolder}
              onNewMemoInFolder={onNewMemoInFolder} onRenameDocument={onRenameDocument}
              onDeleteDocument={onDeleteDocument} onMoveDocument={onMoveDocument}
              onMoveFolder={onMoveFolder}
            />
          ))}

          {node.documents.map((doc) => (
            <DocRow
              key={doc.id} doc={doc} depth={depth + 1}
              selected={selectedDocId === doc.id}
              isMenuOpen={activeMenuId === `doc-${doc.id}`}
              isRenaming={renamingId === `doc-${doc.id}`}
              allFolders={allFolders}
              onSelect={() => onSelectDocument(doc)}
              onOpenMenu={() => onSetActiveMenu(activeMenuId === `doc-${doc.id}` ? null : `doc-${doc.id}`)}
              onStartRename={() => onStartRename(`doc-${doc.id}`)}
              onCancelRename={onCancelRename}
              onRename={(name) => onRenameDocument(doc.id, name)}
              onDelete={() => onDeleteDocument(doc.id)}
              onMove={(fid) => onMoveDocument(doc.id, fid)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Sidebar ────────────────────────────────────────────────────────────

export default function Sidebar({
  tree, rootDocuments, selectedDocId, selectedFolderId,
  autoRenameId, onAutoRenameDone,
  onSelectDocument, onSelectFolder, onNewMemo, onNewMemoInFolder,
  onCreateFolder, onRenameFolder, onDeleteFolder,
  onRenameDocument, onDeleteDocument, onMoveDocument, onMoveFolder,
  workspaces, activeWorkspaceId,
  onSelectWorkspace, onCreateWorkspace, onDeleteWorkspace, onUpdateWorkspace,
}: SidebarProps) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [newSubfolderParentId, setNewSubfolderParentId] = useState<string | null>(null);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [rootDragOver, setRootDragOver] = useState(false);
  const [wsPopoverOpen, setWsPopoverOpen] = useState(false);

  // Derive current workspace info
  const currentWorkspace = workspaces.find((w) => w.id === activeWorkspaceId);
  const currentWorkspaceName = currentWorkspace?.name ?? "워크스페이스";
  const currentWorkspaceColor = currentWorkspace?.color ?? "gray";

  // Auto-rename new memo
  useEffect(() => {
    if (autoRenameId) setRenamingId(`doc-${autoRenameId}`);
  }, [autoRenameId]);

  const allFolders = tree.flatMap(function flatten(n): Folder[] {
    return [n.folder, ...n.children.flatMap(flatten)];
  });

  // ─── Rename handlers ────────────────────────────────────────

  function handleStartRename(id: string) {
    setRenamingId(id);
    setActiveMenuId(null);
  }

  function handleCancelRename() {
    if (autoRenameId && renamingId === `doc-${autoRenameId}`) onAutoRenameDone();
    setRenamingId(null);
  }

  function handleRenameFolder(id: string, name: string) {
    onRenameFolder(id, name);
    setRenamingId(null);
  }

  function handleRenameDocument(id: string, name: string) {
    onRenameDocument(id, name);
    if (autoRenameId === id) onAutoRenameDone();
    setRenamingId(null);
  }

  // ─── Subfolder handlers ─────────────────────────────────────

  function handleStartNewSubfolder(parentId: string) {
    setNewSubfolderParentId(parentId);
    setActiveMenuId(null);
  }

  function handleCreateSubfolder(name: string, parentId: string) {
    onCreateFolder(name, parentId);
    setNewSubfolderParentId(null);
  }

  // ─── Delete handlers (with confirmation) ────────────────────

  function handleDeleteFolder(id: string) {
    setActiveMenuId(null);
    if (!window.confirm("이 폴더를 삭제할까요?\n하위 메모와 폴더는 상위로 이동됩니다.")) return;
    onDeleteFolder(id);
  }

  function handleDeleteDocument(id: string) {
    setActiveMenuId(null);
    if (!window.confirm("이 메모를 삭제할까요?")) return;
    onDeleteDocument(id);
  }

  // ─── New memo in folder ─────────────────────────────────────

  function handleNewMemoInFolder(folderId: string) {
    setActiveMenuId(null);
    onNewMemoInFolder(folderId);
  }

  // ─── Root folder creation ───────────────────────────────────

  function handleCreateRootFolder() {
    const name = newFolderName.trim();
    if (!name) return;
    onCreateFolder(name, null);
    setNewFolderName("");
    setShowNewFolder(false);
  }

  // ─── Root drop zone ─────────────────────────────────────────

  function handleRootDragOver(e: React.DragEvent) {
    if (!canDrop(e)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setRootDragOver(true);
  }

  function handleRootDrop(e: React.DragEvent) {
    e.preventDefault();
    setRootDragOver(false);
    const docId = getDragDocId(e);
    if (docId) { onMoveDocument(docId, null); return; }
    const folderId = getDragFolderId(e);
    if (folderId) onMoveFolder(folderId, null);
  }

  return (
    <aside className="w-[260px] flex-shrink-0 bg-[#f7f7f5] border-r border-black/[0.06] flex flex-col h-full relative">
      {/* Click-outside overlay for context menus */}
      {activeMenuId && (
        <div className="fixed inset-0 z-40" onClick={() => setActiveMenuId(null)} />
      )}

      {/* ── Workspace Switcher ── */}
      <div className="px-3 pt-3 pb-1.5 relative z-[60]">
        <button
          onClick={() => setWsPopoverOpen((v) => !v)}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-black/[0.04] transition-all duration-150"
        >
          <WorkspaceInitial name={currentWorkspaceName} color={currentWorkspaceColor} />
          <span className="flex-1 text-left text-[13px] font-semibold text-gray-900 truncate">
            {currentWorkspaceName}
          </span>
          <SwitcherChevronIcon />
        </button>

        {wsPopoverOpen && (
          <WorkspaceSelector
            workspaces={workspaces}
            activeWorkspaceId={activeWorkspaceId}
            onSelect={onSelectWorkspace}
            onCreate={onCreateWorkspace}
            onDelete={onDeleteWorkspace}
            onUpdate={onUpdateWorkspace}
            onClose={() => setWsPopoverOpen(false)}
          />
        )}
      </div>

      {/* ── Action Buttons ── */}
      <div className="px-3 py-1 relative z-50">
        <button
          onClick={onNewMemo}
          className="w-full flex items-center gap-2 px-2.5 py-[7px] rounded-lg text-[13px] text-gray-600 hover:bg-black/[0.04] transition-colors"
        >
          <PlusIcon />
          새 메모
        </button>
        <button
          onClick={() => setShowNewFolder((v) => !v)}
          className="w-full flex items-center gap-2 px-2.5 py-[7px] rounded-lg text-[13px] text-gray-600 hover:bg-black/[0.04] transition-colors"
        >
          <FolderIcon />
          새 폴더
        </button>

        {showNewFolder && (
          <div className="flex gap-1.5 mt-1 px-0.5">
            <input
              autoFocus
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateRootFolder();
                if (e.key === "Escape") { setShowNewFolder(false); setNewFolderName(""); }
              }}
              onBlur={() => { if (!newFolderName.trim()) setShowNewFolder(false); }}
              placeholder="폴더 이름"
              className="flex-1 min-w-0 rounded-md border border-black/[0.1] bg-white px-2 py-1 text-[12px] outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 placeholder:text-gray-400"
            />
            <button
              onClick={handleCreateRootFolder}
              className="rounded-md bg-indigo-600 px-2.5 py-1 text-[11px] text-white hover:bg-indigo-700 flex-shrink-0 transition-colors"
            >
              확인
            </button>
          </div>
        )}
      </div>

      {/* ── Tree ── */}
      <nav className="flex-1 overflow-y-auto px-2 pt-1 pb-2 space-y-px relative z-50">
        {tree.map((node) => (
          <FolderRow
            key={node.folder.id} node={node} depth={0}
            selectedDocId={selectedDocId} selectedFolderId={selectedFolderId}
            activeMenuId={activeMenuId} renamingId={renamingId}
            newSubfolderParentId={newSubfolderParentId} allFolders={allFolders}
            onSelectDocument={onSelectDocument} onSelectFolder={onSelectFolder}
            onSetActiveMenu={setActiveMenuId} onStartRename={handleStartRename}
            onCancelRename={handleCancelRename} onRenameFolder={handleRenameFolder}
            onDeleteFolder={handleDeleteFolder} onStartNewSubfolder={handleStartNewSubfolder}
            onCancelNewSubfolder={() => setNewSubfolderParentId(null)}
            onCreateSubfolder={handleCreateSubfolder}
            onNewMemoInFolder={handleNewMemoInFolder}
            onRenameDocument={handleRenameDocument}
            onDeleteDocument={handleDeleteDocument} onMoveDocument={onMoveDocument}
            onMoveFolder={onMoveFolder}
          />
        ))}

        {/* Root drop zone (미분류) */}
        <div
          className={`mt-2 pt-2 border-t border-black/[0.06] min-h-[40px] rounded-b-md transition-colors ${
            rootDragOver ? "bg-indigo-500/[0.05] ring-1 ring-indigo-300" : ""
          }`}
          onDragOver={handleRootDragOver}
          onDragLeave={() => setRootDragOver(false)}
          onDrop={handleRootDrop}
        >
          <p className="px-2.5 py-1 text-[11px] font-medium text-gray-400 uppercase tracking-widest">
            미분류
          </p>
          {rootDocuments.map((doc) => (
            <DocRow
              key={doc.id} doc={doc} depth={0}
              selected={selectedDocId === doc.id}
              isMenuOpen={activeMenuId === `doc-${doc.id}`}
              isRenaming={renamingId === `doc-${doc.id}`}
              allFolders={allFolders}
              onSelect={() => onSelectDocument(doc)}
              onOpenMenu={() => setActiveMenuId(activeMenuId === `doc-${doc.id}` ? null : `doc-${doc.id}`)}
              onStartRename={() => handleStartRename(`doc-${doc.id}`)}
              onCancelRename={handleCancelRename}
              onRename={(name) => handleRenameDocument(doc.id, name)}
              onDelete={() => handleDeleteDocument(doc.id)}
              onMove={(fid) => onMoveDocument(doc.id, fid)}
            />
          ))}
          {rootDocuments.length === 0 && !tree.length && (
            <p className="px-2.5 py-4 text-[12px] text-gray-400 text-center">
              아직 메모가 없습니다
            </p>
          )}
        </div>
      </nav>
    </aside>
  );
}
