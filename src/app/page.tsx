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
} from "@/lib/store";

export default function Home() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Selected memo
  const [selectedDoc, setSelectedDoc] = useState<MemoDocument | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newMemoId, setNewMemoId] = useState<string | null>(null);

  // Input state
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Store
  const [refreshKey, setRefreshKey] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    migrateFromHistory();
    setMounted(true);
    setRefreshKey((k) => k + 1);
  }, []);

  const { tree, rootDocuments } = useMemo(() => {
    if (!mounted) return { tree: [], rootDocuments: [] };
    return buildFolderTree();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, refreshKey]);

  function refresh() {
    setRefreshKey((k) => k + 1);
  }

  // ─── Handlers ─────────────────────────────────────────────

  function handleNewMemo() {
    const doc = createDocument("제목 없음", "", { markdown: "" });
    refresh();
    setSelectedDoc(doc);
    setNewMemoId(doc.id);
    setIsEditing(true);
    setText("");
    setError("");
    setSidebarOpen(false);
  }

  function handleNewMemoInFolder(folderId: string) {
    const doc = createDocument("제목 없음", "", { markdown: "" }, folderId);
    refresh();
    setSelectedDoc(doc);
    setNewMemoId(doc.id);
    setIsEditing(true);
    setText("");
    setError("");
    setSidebarOpen(false);
  }

  function handleAutoRenameDone() {
    setNewMemoId(null);
    setTimeout(() => textareaRef.current?.focus(), 50);
  }

  function handleSelectDocument(doc: MemoDocument) {
    setSelectedDoc(doc);
    const hasResult = !!doc.result?.markdown;
    setIsEditing(!hasResult);
    setText(doc.inputText);
    setError("");
    setSidebarOpen(false);
    if (!hasResult) {
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }

  function handleSelectFolder(folderId: string | null) {
    // visual selection only
  }

  async function handleTransform() {
    if (!text.trim() || !selectedDoc) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/transform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "변환에 실패했습니다.");
        return;
      }

      const updates: Partial<Pick<MemoDocument, "title" | "inputText" | "result">> = {
        inputText: text,
        result: data,
      };
      if (selectedDoc.title === "제목 없음") {
        updates.title = text.trim().slice(0, 30) || "제목 없음";
      }
      updateDocument(selectedDoc.id, updates);
      setSelectedDoc({ ...selectedDoc, ...updates } as MemoDocument);
      setIsEditing(false);
      refresh();
    } catch {
      setError("서버와 연결할 수 없습니다.");
    } finally {
      setLoading(false);
    }
  }

  function handleEdit() {
    if (!selectedDoc) return;
    setText(selectedDoc.inputText);
    setIsEditing(true);
    setTimeout(() => textareaRef.current?.focus(), 50);
  }

  // ─── CRUD handlers ────────────────────────────────────────

  function handleCreateFolder(name: string, parentId: string | null) {
    createFolder(name, parentId);
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
      setIsEditing(false);
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

  // ─── Sidebar ──────────────────────────────────────────────

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
    />
  );

  // ─── Render ───────────────────────────────────────────────

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">{sidebarEl}</div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-50 flex">{sidebarEl}</div>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex-shrink-0 border-b border-gray-200 bg-white px-4 py-3 flex items-center justify-between gap-3">
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
            <span className="hidden lg:block text-sm text-gray-500 truncate max-w-xs">
              {selectedDoc ? selectedDoc.title : "RealMemo"}
            </span>
          </div>
          <a
            href="/demo"
            className="flex-shrink-0 rounded-md bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-100 transition-colors"
          >
            위젯 데모
          </a>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {!selectedDoc ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-5xl mb-4 opacity-30">📝</div>
              <p className="text-gray-400 text-sm mb-4">
                메모를 선택하거나 새 메모를 만들어보세요
              </p>
              <button
                onClick={handleNewMemo}
                className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
              >
                새 메모 만들기
              </button>
            </div>
          ) : isEditing ? (
            /* Editing view */
            <div className="mx-auto max-w-3xl">
              <h1 className="mb-6 text-2xl font-bold text-gray-900">{selectedDoc.title}</h1>

              <section className="mb-8">
                <label htmlFor="input-text" className="block text-sm font-semibold text-gray-700 mb-2">
                  텍스트 입력
                </label>
                <textarea
                  ref={textareaRef}
                  id="input-text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={"정리하고 싶은 텍스트를 자유롭게 입력하세요...\n\n예: 회의록, 아이디어, 메모, 강의 노트, 기획안 등"}
                  className="w-full min-h-[200px] rounded-xl border border-gray-300 bg-white px-5 py-4 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none resize-y text-sm leading-relaxed transition-all"
                />
                <div className="mt-4 flex items-center gap-4">
                  <button
                    onClick={handleTransform}
                    disabled={loading || !text.trim()}
                    className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        변환 중...
                      </span>
                    ) : (
                      "변환하기"
                    )}
                  </button>
                  {text.trim() && (
                    <span className="text-xs text-gray-400">{text.length.toLocaleString()}자</span>
                  )}
                  {selectedDoc.result?.markdown && (
                    <button
                      onClick={() => setIsEditing(false)}
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      결과 보기
                    </button>
                  )}
                </div>
              </section>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                  {error}
                </div>
              )}
            </div>
          ) : (
            /* Result view */
            selectedDoc.result?.markdown && (
              <div className="mx-auto max-w-3xl">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <h1 className="text-2xl font-bold text-gray-900">{selectedDoc.title}</h1>
                  <button
                    onClick={handleEdit}
                    className="flex-shrink-0 flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    편집
                  </button>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
                  <ResultView result={selectedDoc.result} />
                </div>
              </div>
            )
          )}
        </main>
      </div>
    </div>
  );
}
