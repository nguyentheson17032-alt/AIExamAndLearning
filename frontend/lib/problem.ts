import type { ProblemDetail } from "./types";

export function problemMessage(problem: ProblemDetail | null, fallback = "Request failed"): string {
  if (!problem) {
    return fallback;
  }
  return problem.detail || problem.title || fallback;
}

export async function readProblem(response: Response): Promise<ProblemDetail> {
  const text = await response.text();
  if (!text) {
    return { status: response.status, title: response.statusText };
  }
  try {
    return JSON.parse(text) as ProblemDetail;
  } catch {
    return { status: response.status, title: response.statusText, detail: text };
  }
}
