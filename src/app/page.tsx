"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import ResultView from "@/components/ResultView";
import Sidebar from "@/components/Sidebar";
import {
  buildFolderTree,
  createFolder,
  renameFolder,
  deleteFolder,
  createDocument,
  updateDocument,
  deleteDocument,
  moveDocument,
  moveFolder,
  migrateFromHistory,
  type MemoDocument,
  type TransformResult,
  type Workspace,
  getWorkspaces,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  getActiveWorkspaceId,
  setActiveWorkspaceId,
  migrateToWorkspaces,
} from "@/lib/store";

export default function Home() {
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Selected memo
  const [selectedDoc, setSelectedDoc] = useState<MemoDocument | null>(null);
  const [newMemoId, setNewMemoId] = useState<string | null>(null);

  // Input state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Workspace
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWsId] = useState<string | null>(null);

  // Store
  const [refreshKey, setRefreshKey] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    migrateFromHistory();
    migrateToWorkspaces();
    const ws = getWorkspaces();
    setWorkspaces(ws);
    const activeId = getActiveWorkspaceId();
    setActiveWsId(activeId);
    setMounted(true);
    setRefreshKey((k) => k + 1);
  }, []);

  const { tree, rootDocuments } = useMemo(() => {
    if (!mounted || !activeWorkspaceId) return { tree: [], rootDocuments: [] };
    return buildFolderTree(activeWorkspaceId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, refreshKey, activeWorkspaceId]);

  function refresh() {
    setRefreshKey((k) => k + 1);
  }

  // ─── Workspace handlers ────────────────────────────────────

  function handleSelectWorkspace(ws: Workspace) {
    setActiveWorkspaceId(ws.id);
    setActiveWsId(ws.id);
    setSelectedDoc(null);
    refresh();
  }

  function handleCreateWorkspace(name: string, emoji: string, color: string) {
    const ws = createWorkspace(name, emoji, color);
    setWorkspaces(getWorkspaces());
    handleSelectWorkspace(ws);
  }

  function handleDeleteWorkspace(id: string) {
    deleteWorkspace(id);
    const remaining = getWorkspaces();
    setWorkspaces(remaining);
    if (activeWorkspaceId === id) {
      if (remaining.length > 0) {
        handleSelectWorkspace(remaining[0]);
      } else {
        setActiveWsId(null);
      }
    }
  }

  function handleUpdateWorkspace(id: string, updates: { name?: string; emoji?: string; color?: string }) {
    updateWorkspace(id, updates);
    setWorkspaces(getWorkspaces());
  }

  // ─── Handlers ─────────────────────────────────────────────

  function handleNewMemo() {
    if (!activeWorkspaceId) return;
    const doc = createDocument("제목 없음", "", { markdown: "" }, null, activeWorkspaceId);
    refresh();
    setSelectedDoc(doc);
    setNewMemoId(doc.id);
    setError("");
    setSidebarOpen(false);
  }

  function handleNewMemoInFolder(folderId: string) {
    if (!activeWorkspaceId) return;
    const doc = createDocument("제목 없음", "", { markdown: "" }, folderId, activeWorkspaceId);
    refresh();
    setSelectedDoc(doc);
    setNewMemoId(doc.id);
    setError("");
    setSidebarOpen(false);
  }

  function handleAutoRenameDone() {
    setNewMemoId(null);
  }

  function handleSelectDocument(doc: MemoDocument) {
    setSelectedDoc(doc);
    setError("");
    setSidebarOpen(false);
  }

  function handleSelectFolder(_folderId: string | null) {
    // visual selection only
  }

  async function handleTransform() {
    const currentText = selectedDoc?.result?.markdown?.trim();
    if (!currentText || !selectedDoc) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/transform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: currentText }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "변환에 실패했습니다.");
        return;
      }

      const updates: Partial<Pick<MemoDocument, "title" | "inputText" | "result">> = {
        inputText: currentText,
        result: data,
      };
      if (selectedDoc.title === "제목 없음") {
        updates.title = currentText.slice(0, 30) || "제목 없음";
      }
      updateDocument(selectedDoc.id, updates);
      setSelectedDoc({ ...selectedDoc, ...updates } as MemoDocument);
      refresh();
    } catch {
      setError("서버와 연결할 수 없습니다.");
    } finally {
      setLoading(false);
    }
  }

  function handleResultChange(newResult: TransformResult) {
    if (!selectedDoc) return;
    setSelectedDoc({ ...selectedDoc, result: newResult } as MemoDocument);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      updateDocument(selectedDoc.id, { result: newResult });
    }, 500);
  }

  // ─── CRUD handlers ────────────────────────────────────────

  function handleCreateFolder(name: string, parentId: string | null) {
    if (!activeWorkspaceId) return;
    createFolder(name, parentId, activeWorkspaceId);
    refresh();
  }

  function handleRenameFolder(id: string, name: string) {
    renameFolder(id, name);
    refresh();
  }

  function handleDeleteFolder(id: string) {
    deleteFolder(id);
    refresh();
  }

  function handleRenameDocument(id: string, name: string) {
    updateDocument(id, { title: name });
    if (selectedDoc?.id === id) {
      setSelectedDoc((d) => (d ? { ...d, title: name } : d));
    }
    refresh();
  }

  function handleDeleteDocument(id: string) {
    deleteDocument(id);
    if (selectedDoc?.id === id) {
      setSelectedDoc(null);
    }
    refresh();
  }

  function handleMoveDocument(docId: string, folderId: string | null) {
    moveDocument(docId, folderId);
    if (selectedDoc?.id === docId) {
      setSelectedDoc((d) => (d ? { ...d, folderId } : d));
    }
    refresh();
  }

  function handleMoveFolder(folderId: string, newParentId: string | null) {
    moveFolder(folderId, newParentId);
    refresh();
  }

  // ─── Sidebar element ──────────────────────────────────────

  const sidebarEl = (
    <Sidebar
      tree={tree}
      rootDocuments={rootDocuments}
      selectedDocId={selectedDoc?.id ?? null}
      selectedFolderId={null}
      autoRenameId={newMemoId}
      onAutoRenameDone={handleAutoRenameDone}
      onSelectDocument={handleSelectDocument}
      onSelectFolder={handleSelectFolder}
      onNewMemo={handleNewMemo}
      onNewMemoInFolder={handleNewMemoInFolder}
      onCreateFolder={handleCreateFolder}
      onRenameFolder={handleRenameFolder}
      onDeleteFolder={handleDeleteFolder}
      onRenameDocument={handleRenameDocument}
      onDeleteDocument={handleDeleteDocument}
      onMoveDocument={handleMoveDocument}
      onMoveFolder={handleMoveFolder}
      workspaces={workspaces}
      activeWorkspaceId={activeWorkspaceId}
      onSelectWorkspace={handleSelectWorkspace}
      onCreateWorkspace={handleCreateWorkspace}
      onDeleteWorkspace={handleDeleteWorkspace}
      onUpdateWorkspace={handleUpdateWorkspace}
    />
  );

  // ─── Render ───────────────────────────────────────────────

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">{sidebarEl}</div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative z-50 flex">{sidebarEl}</div>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex-shrink-0 border-b border-black/[0.06] bg-white/80 backdrop-blur-xl px-5 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              className="lg:hidden p-1.5 rounded-md text-gray-500 hover:bg-gray-100 transition-colors flex-shrink-0"
              onClick={() => setSidebarOpen(true)}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <a href="/" className="lg:hidden text-base font-bold text-gray-900 flex-shrink-0">
              <span className="text-indigo-600">Real</span>Memo
            </a>
            <span className="hidden lg:block text-sm font-medium text-gray-700 truncate max-w-xs">
              {selectedDoc ? selectedDoc.title : "RealMemo"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {selectedDoc && (
              <button
                onClick={handleTransform}
                disabled={loading || !selectedDoc.result?.markdown?.trim()}
                className="flex-shrink-0 flex items-center gap-1.5 rounded-full bg-indigo-50 px-3.5 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                )}
                AI로 정리하기
              </button>
            )}
            <a
              href="/demo"
              className="flex-shrink-0 text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              위젯 데모
            </a>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {!selectedDoc ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-5">
                <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1.5">메모를 선택하세요</h3>
              <p className="text-sm text-gray-400 mb-6 max-w-xs">
                사이드바에서 메모를 선택하거나 새 메모를 만들어보세요
              </p>
              <button
                onClick={handleNewMemo}
                className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
                </svg>
                새 메모 만들기
              </button>
            </div>
          ) : (
            /* Unified editor view — always WYSIWYG */
            <div className="mx-auto py-8 px-6" style={{ width: "48rem", maxWidth: "100%", minWidth: "20rem", resize: "horizontal", overflow: "hidden" }}>
              <h1 className="mb-6 text-2xl font-semibold text-gray-900 tracking-tight">
                {selectedDoc.title}
              </h1>

              <ResultView key={selectedDoc.id} result={selectedDoc.result} onResultChange={handleResultChange} />

              {error && (
                <div className="mt-4 rounded-xl border border-red-100 bg-red-50/50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
