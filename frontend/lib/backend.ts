import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { problemMessage, readProblem } from "./problem";
import { safeInternalPath } from "./safe-path";
import { getAccessToken, getRefreshToken } from "./session";
import type { AuthResponse } from "./types";

export const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8080";

function isNextRedirect(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

export function rethrowIfRedirect(error: unknown): void {
  if (isNextRedirect(error)) {
    throw error;
  }
}

async function redirectForUnauthorized(): Promise<never> {
  if (!(await getRefreshToken())) {
    redirect("/api/session/clear");
  }
  const pathname = (await headers()).get("x-pathname") ?? "/";
  redirect(`/api/session/refresh?next=${encodeURIComponent(safeInternalPath(pathname))}`);
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly title: string,
    public readonly detail?: string,
  ) {
    super(detail || title);
    this.name = "ApiError";
  }
}

export function errorMessage(error: unknown, fallback = "Request failed"): string {
  if (error instanceof ApiError) {
    return error.detail || error.title || fallback;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

export async function backendFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const requestHeaders = new Headers(init.headers);
  if (init.body && !(init.body instanceof FormData) && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }
  const token = await getAccessToken();
  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${BACKEND_URL}${path}`, {
    ...init,
    headers: requestHeaders,
    cache: "no-store",
  });

  if (response.status === 401) {
    await redirectForUnauthorized();
  }

  if (response.status === 204) {
    return undefined as T;
  }

  if (!response.ok) {
    const problem = await readProblem(response);
    throw new ApiError(
      response.status,
      problem.title || response.statusText,
      problemMessage(problem),
    );
  }

  if (response.status === 201 && response.headers.get("content-length") === "0") {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function backendAuth(path: "/api/v1/auth/login" | "/api/v1/auth/register", body: unknown) {
  const response = await fetch(`${BACKEND_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!response.ok) {
    const problem = await readProblem(response);
    throw new ApiError(
      response.status,
      problem.title || response.statusText,
      problemMessage(problem, path.endsWith("register") ? "Register failed" : "Login failed"),
    );
  }
  return (await response.json()) as AuthResponse;
}
