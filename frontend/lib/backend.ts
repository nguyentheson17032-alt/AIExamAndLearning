import { problemMessage, readProblem } from "./problem";
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  persistAuth,
} from "./session";
import type { AuthResponse } from "./types";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8080";

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

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    return null;
  }
  const response = await fetch(`${BACKEND_URL}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
  });
  if (!response.ok) {
    await clearSession();
    return null;
  }
  const auth = (await response.json()) as AuthResponse;
  await persistAuth(auth);
  return auth.accessToken;
}

export async function backendFetch<T>(
  path: string,
  init: RequestInit = {},
  retry = true,
): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const token = await getAccessToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${BACKEND_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (response.status === 401 && retry) {
    const nextToken = await refreshAccessToken();
    if (nextToken) {
      return backendFetch<T>(path, init, false);
    }
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
