export const API_BASE = "http://127.0.0.1:8001";

export interface Topic {
  label: string;
  keywords: string[];
  size: number;
  mean_year: number | null;
  x: number;
  y: number;
}

export type GapVerdict = "CONFIRMED" | "WEAK" | "REJECTED" | "UNVERIFIED";

export interface Gap {
  topic_a: string;
  topic_b: string;
  keywords_a: string[];
  keywords_b: string[];
  bridge_papers: number;
  size_a: number;
  size_b: number;
  prominence: number;
  verification_queries: string[];
  recent_papers_found: number;
  verdict: GapVerdict;
  confidence: number;
}

export interface AnalyzeResponse {
  topic: string;
  papers_count: number;
  topics: Topic[];
  gaps: Gap[];
  confirmed_count: number;
  weak_count: number;
  rejected_count: number;
  unverified_count: number;
  report: string;
}

export interface Stats {
  total_papers_analyzed: number;
  total_analyses: number;
  total_gaps_found: number;
  total_confirmed: number;
}

export type JobStatus = "pending" | "running" | "done" | "error";

export interface Job {
  job_id: string;
  status: JobStatus;
  topic: string;
  papers: number;
  stage: number;
  stage_label: string;
  created_at: number;
  updated_at: number;
  result: AnalyzeResponse | null;
  error: string | null;
}

/** The backend is unreachable — network failure, not an application error. */
export class EngineOfflineError extends Error {
  constructor() {
    super("ENGINE OFFLINE");
    this.name = "EngineOfflineError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, init);
  } catch {
    throw new EngineOfflineError();
  }
  if (!res.ok) {
    const detail = await res.json().catch(() => null);
    throw new Error(detail?.detail ?? `Request failed with status ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function getStats(): Promise<Stats> {
  return request<Stats>("/stats");
}

/** Kicks off the pipeline server-side and returns immediately with a job id
 * to poll — the pipeline itself can take minutes, so this must never be the
 * call that's left holding an HTTP connection open. */
export function startAnalysis(topic: string, papers: number): Promise<{ job_id: string }> {
  return request<{ job_id: string }>("/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, papers }),
  });
}

export function getJob(jobId: string): Promise<Job> {
  return request<Job>(`/jobs/${jobId}`);
}
