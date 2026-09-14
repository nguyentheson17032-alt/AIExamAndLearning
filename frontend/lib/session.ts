import { cookies } from "next/headers";
import type { AuthResponse, SessionUser } from "./types";
import { isStaffRole } from "./roles";
import { safeInternalPath } from "./safe-path";

export { safeInternalPath };

export const ACCESS_COOKIE = "ew_access_v1";
export const REFRESH_COOKIE = "ew_refresh_v1";
export const USER_COOKIE = "ew_user_v1";

export const REFRESH_MAX_AGE = 60 * 60 * 24 * 7;

export function sessionCookieBase() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
}

export function sessionUserFromAuth(auth: AuthResponse): SessionUser {
  return {
    userId: auth.userId,
    email: auth.email,
    displayName: auth.displayName,
    role: auth.role,
    eloRating: auth.eloRating,
    rankCode: auth.rankCode,
  };
}

export async function persistAuth(auth: AuthResponse): Promise<void> {
  const store = await cookies();
  const base = sessionCookieBase();
  store.set(ACCESS_COOKIE, auth.accessToken, {
    ...base,
    maxAge: auth.expiresInSeconds,
  });
  store.set(REFRESH_COOKIE, auth.refreshToken, {
    ...base,
    maxAge: REFRESH_MAX_AGE,
  });
  await persistSessionUser(sessionUserFromAuth(auth));
}

export async function persistSessionUser(user: SessionUser): Promise<void> {
  const store = await cookies();
  store.set(USER_COOKIE, JSON.stringify(user), {
    ...sessionCookieBase(),
    maxAge: REFRESH_MAX_AGE,
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  const base = sessionCookieBase();
  store.set(ACCESS_COOKIE, "", { ...base, maxAge: 0 });
  store.set(REFRESH_COOKIE, "", { ...base, maxAge: 0 });
  store.set(USER_COOKIE, "", { ...base, maxAge: 0 });
}

export async function getAccessToken(): Promise<string | undefined> {
  return (await cookies()).get(ACCESS_COOKIE)?.value;
}

export async function getRefreshToken(): Promise<string | undefined> {
  return (await cookies()).get(REFRESH_COOKIE)?.value;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const raw = (await cookies()).get(USER_COOKIE)?.value;
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export function isTeacher(user: SessionUser | null): boolean {
  return user != null && isStaffRole(user.role);
}
