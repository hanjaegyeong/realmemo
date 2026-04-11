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

export interface Workspace {
  id: string;
  name: string;
  emoji: string;       // 기본값 "📁"
  color: string;       // tailwind 색상 키 (예: "indigo", "rose", "emerald" 등)
  createdAt: string;
  updatedAt: string;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null; // null = root level
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface MemoDocument {
  id: string;
  title: string;
  folderId: string | null; // null = root level (미분류)
  workspaceId: string;
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
const WORKSPACES_KEY = "realmemo_workspaces";
const ACTIVE_WORKSPACE_KEY = "realmemo_active_workspace";

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

function readWorkspaces(): Workspace[] {
  try {
    const raw = localStorage.getItem(WORKSPACES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Workspace[];
  } catch {
    return [];
  }
}

function writeWorkspaces(workspaces: Workspace[]): void {
  localStorage.setItem(WORKSPACES_KEY, JSON.stringify(workspaces));
}

// ─── Workspace functions ─────────────────────────────────────────────────────

export function getWorkspaces(): Workspace[] {
  return readWorkspaces();
}

export function createWorkspace(
  name: string,
  emoji: string = "📁",
  color: string = "indigo"
): Workspace {
  const now = new Date().toISOString();
  const workspace: Workspace = {
    id: crypto.randomUUID(),
    name,
    emoji,
    color,
    createdAt: now,
    updatedAt: now,
  };
  const workspaces = [...readWorkspaces(), workspace];
  writeWorkspaces(workspaces);
  return workspace;
}

export function updateWorkspace(
  id: string,
  updates: Partial<Pick<Workspace, "name" | "emoji" | "color">>
): void {
  const workspaces = readWorkspaces().map((w) =>
    w.id === id ? { ...w, ...updates, updatedAt: new Date().toISOString() } : w
  );
  writeWorkspaces(workspaces);
}

export function deleteWorkspace(id: string): void {
  const workspaces = readWorkspaces().filter((w) => w.id !== id);
  writeWorkspaces(workspaces);

  // 해당 워크스페이스의 모든 폴더와 문서 삭제
  const folders = readFolders().filter((f) => f.workspaceId !== id);
  writeFolders(folders);

  const documents = readDocuments().filter((d) => d.workspaceId !== id);
  writeDocuments(documents);
}

export function getActiveWorkspaceId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_WORKSPACE_KEY);
  } catch {
    return null;
  }
}

export function setActiveWorkspaceId(id: string): void {
  localStorage.setItem(ACTIVE_WORKSPACE_KEY, id);
}

// ─── Folder functions ─────────────────────────────────────────────────────────

export function getFolders(): Folder[] {
  return readFolders();
}

export function createFolder(
  name: string,
  parentId: string | null = null,
  workspaceId?: string
): Folder {
  const now = new Date().toISOString();
  const folder: Folder = {
    id: crypto.randomUUID(),
    name,
    parentId,
    workspaceId: workspaceId ?? getActiveWorkspaceId() ?? "",
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
  folderId: string | null = null,
  workspaceId?: string
): MemoDocument {
  const now = new Date().toISOString();
  const doc: MemoDocument = {
    id: crypto.randomUUID(),
    title,
    folderId,
    workspaceId: workspaceId ?? getActiveWorkspaceId() ?? "",
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

export function buildFolderTree(workspaceId?: string): {
  tree: FolderTreeNode[];
  rootDocuments: MemoDocument[];
} {
  const wsId = workspaceId ?? getActiveWorkspaceId() ?? "";
  const allFolders = readFolders();
  const allDocuments = readDocuments();

  const folders = allFolders.filter((f) => f.workspaceId === wsId);
  const documents = allDocuments.filter((d) => d.workspaceId === wsId);

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
    if (!raw) {
      migrateToWorkspaces();
      return;
    }

    const entries = JSON.parse(raw) as HistoryEntry[];
    if (!Array.isArray(entries) || entries.length === 0) {
      localStorage.removeItem(HISTORY_KEY);
      migrateToWorkspaces();
      return;
    }

    // Skip if documents already exist (idempotent)
    const existing = readDocuments();
    const existingIds = new Set(existing.map((d) => d.id));
    const toMigrate = entries.filter((e) => !existingIds.has(e.id));

    if (toMigrate.length === 0) {
      localStorage.removeItem(HISTORY_KEY);
      migrateToWorkspaces();
      return;
    }

    const migrated: MemoDocument[] = toMigrate.map((entry) => ({
      id: entry.id,
      title: entry.inputText.trim().slice(0, 60) || "제목 없음",
      folderId: null,
      workspaceId: "",
      inputText: entry.inputText,
      result: entry.result as TransformResult,
      createdAt: entry.createdAt,
      updatedAt: entry.createdAt,
    }));

    writeDocuments([...migrated, ...existing]);
    localStorage.removeItem(HISTORY_KEY);
    migrateToWorkspaces();
  } catch {
    // Migration is best-effort; never throw
  }
}

export function migrateToWorkspaces(): void {
  try {
    const workspaces = readWorkspaces();

    // 워크스페이스가 이미 존재하면 빈 workspaceId만 보정
    if (workspaces.length > 0) {
      const defaultId = getActiveWorkspaceId() ?? workspaces[0].id;

      const folders = readFolders();
      const needsFolderFix = folders.some((f) => !f.workspaceId);
      if (needsFolderFix) {
        const fixed = folders.map((f) =>
          f.workspaceId ? f : { ...f, workspaceId: defaultId }
        );
        writeFolders(fixed);
      }

      const documents = readDocuments();
      const needsDocFix = documents.some((d) => !d.workspaceId);
      if (needsDocFix) {
        const fixed = documents.map((d) =>
          d.workspaceId ? d : { ...d, workspaceId: defaultId }
        );
        writeDocuments(fixed);
      }

      return;
    }

    // 워크스페이스가 없으면 기본 워크스페이스 생성
    const now = new Date().toISOString();
    const defaultWorkspace: Workspace = {
      id: crypto.randomUUID(),
      name: "기본 워크스페이스",
      emoji: "📝",
      color: "indigo",
      createdAt: now,
      updatedAt: now,
    };
    writeWorkspaces([defaultWorkspace]);
    setActiveWorkspaceId(defaultWorkspace.id);

    // 기존 폴더에 workspaceId 부여
    const folders = readFolders();
    if (folders.length > 0) {
      const fixed = folders.map((f) =>
        f.workspaceId ? f : { ...f, workspaceId: defaultWorkspace.id }
      );
      writeFolders(fixed);
    }

    // 기존 문서에 workspaceId 부여
    const documents = readDocuments();
    if (documents.length > 0) {
      const fixed = documents.map((d) =>
        d.workspaceId ? d : { ...d, workspaceId: defaultWorkspace.id }
      );
      writeDocuments(fixed);
    }
  } catch {
    // Migration is best-effort; never throw
  }
}
