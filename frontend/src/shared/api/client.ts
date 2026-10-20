export interface Question {
  question: string;
  options: string[];
  correctIndices: number[];
  /** Legacy shape from quizzes saved before multi-answer support. */
  correctIndex?: number;
}

function normalizeQuestion(q: Question): Question {
  if (!q.correctIndices && typeof q.correctIndex === "number") {
    return { ...q, correctIndices: [q.correctIndex] };
  }
  return q;
}

function normalizeQuiz<T extends { questions: Question[] }>(quiz: T): T {
  return { ...quiz, questions: quiz.questions.map(normalizeQuestion) };
}

export interface Quiz {
  id: string;
  title: string;
  raw_text: string;
  questions: Question[];
  created_at: string;
  folder_id: string | null;
  folder_title?: string | null;
  position: number | null;
}

export type SortOption = "newest" | "oldest" | "title_asc" | "title_desc" | "questions_desc";

export interface QuizPage {
  items: Quiz[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface QuizPageParams {
  q?: string;
  folder?: string;
  sort?: SortOption;
  page?: number;
  pageSize?: number;
}

export interface Folder {
  id: string;
  title: string;
  created_at: string;
  quizzes: Quiz[];
}

function normalizeFolder(folder: Folder): Folder {
  return { ...folder, quizzes: folder.quizzes.map((q) => normalizeQuiz(q)) };
}

export function splitPreview(total: number, chunkSize: number): number[] {
  if (chunkSize <= 0) return [];
  const parts: number[] = [];
  for (let start = 0; start < total; start += chunkSize) {
    parts.push(Math.min(chunkSize, total - start));
  }
  return parts;
}

const BASE = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000").replace(/\/$/, "");

export async function parseQuiz(title: string, raw_text: string): Promise<Quiz> {
  const res = await fetch(`${BASE}/api/quizzes/parse`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, raw_text }),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => null))?.detail ?? "Parse failed");
  return normalizeQuiz(await res.json());
}

export async function fetchQuizPage(
  params: QuizPageParams,
  signal?: AbortSignal,
): Promise<QuizPage> {
  const search = new URLSearchParams({
    q: params.q ?? "",
    folder: params.folder ?? "all",
    sort: params.sort ?? "newest",
    page: String(params.page ?? 1),
    page_size: String(params.pageSize ?? 12),
  });
  const res = await fetch(`${BASE}/api/quizzes?${search}`, { signal });
  if (!res.ok) throw new Error("Failed to load quizzes");
  const data = await res.json() as QuizPage;
  return { ...data, items: data.items.map(normalizeQuiz) };
}

export async function fetchQuiz(id: string, signal?: AbortSignal): Promise<Quiz> {
  const res = await fetch(`${BASE}/api/quizzes/${id}`, { signal });
  if (!res.ok) throw new Error("Quiz not found");
  return normalizeQuiz(await res.json());
}

export async function deleteQuiz(id: string): Promise<void> {
  const res = await fetch(`${BASE}/api/quizzes/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Delete failed");
}

export async function splitQuiz(id: string, chunk_size: number, folder_title?: string): Promise<Folder> {
  const res = await fetch(`${BASE}/api/quizzes/${id}/split`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chunk_size, folder_title: folder_title || undefined }),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => null))?.detail ?? "Split failed");
  return normalizeFolder(await res.json());
}

export async function fetchFolders(signal?: AbortSignal): Promise<Folder[]> {
  const res = await fetch(`${BASE}/api/folders`, { signal });
  if (!res.ok) throw new Error("Failed to load folders");
  return (await res.json() as Folder[]).map(normalizeFolder);
}

export async function deleteFolder(id: string): Promise<void> {
  const res = await fetch(`${BASE}/api/folders/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Delete failed");
}
