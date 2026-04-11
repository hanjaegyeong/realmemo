import { HistoryEntry } from "./history";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TransformResult {
  markdown: string;
  diagrams?: string[];
  widgets?: Array<{
    type: string;
    title: string;
    data: Record<string, unknown>;
  }>;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null; // null = root level
  createdAt: string;
  updatedAt: string;
}

export interface MemoDocument {
  id: string;
  title: string;
  folderId: string | null; // null = root level (미분류)
  inputText: string;
  result: TransformResult;
  createdAt: string;
  updatedAt: string;
}

export interface FolderTreeNode {
  folder: Folder;
  children: FolderTreeNode[];
  documents: MemoDocument[];
}

// ─── Storage keys ────────────────────────────────────────────────────────────

const FOLDERS_KEY = "realmemo_folders";
const DOCUMENTS_KEY = "realmemo_documents";
const HISTORY_KEY = "realmemo_history";

// ─── Low-level helpers ───────────────────────────────────────────────────────

function readFolders(): Folder[] {
  try {
    const raw = localStorage.getItem(FOLDERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Folder[];
  } catch {
    return [];
  }
}

function writeFolders(folders: Folder[]): void {
  localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
}

function readDocuments(): MemoDocument[] {
  try {
    const raw = localStorage.getItem(DOCUMENTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as MemoDocument[];
  } catch {
    return [];
  }
}

function writeDocuments(documents: MemoDocument[]): void {
  localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(documents));
}

// ─── Folder functions ─────────────────────────────────────────────────────────

export function getFolders(): Folder[] {
  return readFolders();
}

export function createFolder(
  name: string,
  parentId: string | null = null
): Folder {
  const now = new Date().toISOString();
  const folder: Folder = {
    id: crypto.randomUUID(),
    name,
    parentId,
    createdAt: now,
    updatedAt: now,
  };
  const folders = [...readFolders(), folder];
  writeFolders(folders);
  return folder;
}

export function renameFolder(id: string, name: string): void {
  const folders = readFolders().map((f) =>
    f.id === id ? { ...f, name, updatedAt: new Date().toISOString() } : f
  );
  writeFolders(folders);
}

export function deleteFolder(id: string): void {
  const folders = readFolders();
  const target = folders.find((f) => f.id === id);
  if (!target) return;

  const parentId = target.parentId;

  // Re-parent child folders to the deleted folder's parent
  const updatedFolders = folders
    .filter((f) => f.id !== id)
    .map((f) =>
      f.parentId === id
        ? { ...f, parentId, updatedAt: new Date().toISOString() }
        : f
    );
  writeFolders(updatedFolders);

  // Re-parent documents in this folder to the deleted folder's parent
  const documents = readDocuments().map((d) =>
    d.folderId === id
      ? { ...d, folderId: parentId, updatedAt: new Date().toISOString() }
      : d
  );
  writeDocuments(documents);
}

export function moveFolder(id: string, newParentId: string | null): void {
  if (id === newParentId) return;

  // Prevent circular: newParentId must not be a descendant of id
  const folders = readFolders();
  let cur = newParentId;
  while (cur !== null) {
    if (cur === id) return;
    const parent = folders.find((f) => f.id === cur);
    if (!parent) break;
    cur = parent.parentId;
  }

  const updated = folders.map((f) =>
    f.id === id
      ? { ...f, parentId: newParentId, updatedAt: new Date().toISOString() }
      : f
  );
  writeFolders(updated);
}

export function getFolderPath(folderId: string): Folder[] {
  const folders = readFolders();
  const path: Folder[] = [];

  let currentId: string | null = folderId;
  while (currentId !== null) {
    const folder = folders.find((f) => f.id === currentId);
    if (!folder) break;
    path.unshift(folder);
    currentId = folder.parentId;
  }

  return path;
}

// ─── Document functions ───────────────────────────────────────────────────────

export function getDocuments(): MemoDocument[] {
  return readDocuments();
}

export function getDocumentsByFolder(folderId: string | null): MemoDocument[] {
  return readDocuments().filter((d) => d.folderId === folderId);
}

export function getDocumentById(id: string): MemoDocument | null {
  return readDocuments().find((d) => d.id === id) ?? null;
}

export function createDocument(
  title: string,
  inputText: string,
  result: TransformResult,
  folderId: string | null = null
): MemoDocument {
  const now = new Date().toISOString();
  const doc: MemoDocument = {
    id: crypto.randomUUID(),
    title,
    folderId,
    inputText,
    result,
    createdAt: now,
    updatedAt: now,
  };
  const documents = [doc, ...readDocuments()];
  writeDocuments(documents);
  return doc;
}

export function updateDocument(
  id: string,
  updates: Partial<Pick<MemoDocument, "title" | "folderId" | "inputText" | "result">>
): void {
  const documents = readDocuments().map((d) =>
    d.id === id
      ? { ...d, ...updates, updatedAt: new Date().toISOString() }
      : d
  );
  writeDocuments(documents);
}

export function deleteDocument(id: string): void {
  const documents = readDocuments().filter((d) => d.id !== id);
  writeDocuments(documents);
}

export function moveDocument(id: string, folderId: string | null): void {
  updateDocument(id, { folderId });
}

// ─── Tree builder ─────────────────────────────────────────────────────────────

export function buildFolderTree(): {
  tree: FolderTreeNode[];
  rootDocuments: MemoDocument[];
} {
  const folders = readFolders();
  const documents = readDocuments();

  const rootDocuments = documents.filter((d) => d.folderId === null);

  function buildNode(folder: Folder): FolderTreeNode {
    const children = folders
      .filter((f) => f.parentId === folder.id)
      .map(buildNode);
    const docs = documents.filter((d) => d.folderId === folder.id);
    return { folder, children, documents: docs };
  }

  const tree = folders
    .filter((f) => f.parentId === null)
    .map(buildNode);

  return { tree, rootDocuments };
}

// ─── Migration ────────────────────────────────────────────────────────────────

export function migrateFromHistory(): void {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return;

    const entries = JSON.parse(raw) as HistoryEntry[];
    if (!Array.isArray(entries) || entries.length === 0) {
      localStorage.removeItem(HISTORY_KEY);
      return;
    }

    // Skip if documents already exist (idempotent)
    const existing = readDocuments();
    const existingIds = new Set(existing.map((d) => d.id));
    const toMigrate = entries.filter((e) => !existingIds.has(e.id));

    if (toMigrate.length === 0) {
      localStorage.removeItem(HISTORY_KEY);
      return;
    }

    const migrated: MemoDocument[] = toMigrate.map((entry) => ({
      id: entry.id,
      title: entry.inputText.trim().slice(0, 60) || "제목 없음",
      folderId: null,
      inputText: entry.inputText,
      result: entry.result as TransformResult,
      createdAt: entry.createdAt,
      updatedAt: entry.createdAt,
    }));

    writeDocuments([...migrated, ...existing]);
    localStorage.removeItem(HISTORY_KEY);
  } catch {
    // Migration is best-effort; never throw
  }
}
