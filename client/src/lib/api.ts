const BASE = "/api";

async function request<T>(
  path: string,
  options?: RequestInit,
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw Object.assign(new Error(body.error ?? "Request failed"), {
      status: res.status,
    });
  }

  return res.json() as Promise<T>;
}

export const api = {
  getTopics: (token: string) =>
    request<Topic[]>("/topics", undefined, token),

  saveTopics: (token: string, topicIds: number[]) =>
    request<{ ok: boolean }>("/topics/me", {
      method: "PUT",
      body: JSON.stringify({ topicIds }),
    }, token),

  getUser: (token: string) =>
    request<UserProfile>("/users/me", undefined, token),

  getHistory: (token: string) =>
    request<DailyPaperRecord[]>("/users/me/history", undefined, token),

  getDaily: (token: string) =>
    request<DailyPaperResponse>("/daily", undefined, token),

  completeReading: (token: string) =>
    request<{ ok: boolean }>("/daily/complete", { method: "POST" }, token),

  getQuiz: (token: string) =>
    request<{ quiz: QuizQuestion[] }>("/daily/quiz", undefined, token),

  submitQuiz: (token: string, answers: number[]) =>
    request<QuizResult>("/daily/quiz/submit", {
      method: "POST",
      body: JSON.stringify({ answers }),
    }, token),
};

// Types
export interface Topic {
  id: number;
  name: string;
  arxivCategory: string;
}

export interface UserProfile {
  id: string;
  email: string;
  streak: number;
  lastActive: string | null;
  topics: Topic[];
}

export interface Paper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  arxivUrl: string;
  publishedAt: string;
  summary: string;
  topicId: number;
}

export interface DailyPaperResponse {
  id: number;
  userId: string;
  paperId: string;
  date: string;
  completed: boolean;
  score: number | null;
  paper: Paper;
}

export interface DailyPaperRecord {
  id: number;
  date: string;
  completed: boolean;
  score: number | null;
  paper: {
    id: string;
    title: string;
    authors: string[];
    arxivUrl: string;
    topicId: number;
  };
}

export interface QuizQuestion {
  question: string;
  options: [string, string, string, string];
}

export interface QuizResult {
  score: number;
  total: number;
  passed: boolean;
  newStreak: number;
}
