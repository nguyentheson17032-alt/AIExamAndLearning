import { BACKEND_URL } from "@/lib/backend";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  REFRESH_MAX_AGE,
  USER_COOKIE,
  safeInternalPath,
  sessionCookieBase,
  sessionUserFromAuth,
} from "@/lib/session";
import type { AuthResponse } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

function clearAndLogin(request: Request) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  const expired = { ...sessionCookieBase(), maxAge: 0 };
  response.cookies.set(ACCESS_COOKIE, "", expired);
  response.cookies.set(REFRESH_COOKIE, "", expired);
  response.cookies.set(USER_COOKIE, "", expired);
  return response;
}

export async function GET(request: NextRequest) {
  const next = safeInternalPath(request.nextUrl.searchParams.get("next"));
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) {
    return clearAndLogin(request);
  }

  const refreshResponse = await fetch(`${BACKEND_URL}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
  });
  if (!refreshResponse.ok) {
    return clearAndLogin(request);
  }

  const auth = (await refreshResponse.json()) as AuthResponse;
  const response = NextResponse.redirect(new URL(next, request.url));
  const base = sessionCookieBase();
  response.cookies.set(ACCESS_COOKIE, auth.accessToken, {
    ...base,
    maxAge: auth.expiresInSeconds,
  });
  response.cookies.set(REFRESH_COOKIE, auth.refreshToken, {
    ...base,
    maxAge: REFRESH_MAX_AGE,
  });
  response.cookies.set(USER_COOKIE, JSON.stringify(sessionUserFromAuth(auth)), {
    ...base,
    maxAge: REFRESH_MAX_AGE,
  });
  return response;
}
