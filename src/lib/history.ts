export interface TransformResult {
  markdown: string;
  diagrams?: string[];
  widgets?: Array<{
    type: "table" | "timeline" | "checklist" | "summary_card";
    title: string;
    data: Record<string, unknown>;
  }>;
}

export interface HistoryEntry {
  id: string;
  inputText: string;
  result: TransformResult;
  createdAt: string; // ISO string
}

const STORAGE_KEY = "realmemo_history";
const MAX_ENTRIES = 50;

export function getHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
}

export function saveHistory(
  inputText: string,
  result: TransformResult
): HistoryEntry {
  const entry: HistoryEntry = {
    id: crypto.randomUUID(),
    inputText,
    result,
    createdAt: new Date().toISOString(),
  };
  const entries = [entry, ...getHistory()].slice(0, MAX_ENTRIES);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  return entry;
}

export function deleteHistoryEntry(id: string): void {
  const entries = getHistory().filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getPreviewText(entry: HistoryEntry, maxLen = 80): string {
  const text = entry.inputText.trim();
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + "...";
}
