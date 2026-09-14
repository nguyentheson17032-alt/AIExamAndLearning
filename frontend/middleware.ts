import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/session";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = new Set(["/login", "/register"]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const signedIn =
    Boolean(request.cookies.get(ACCESS_COOKIE)?.value) ||
    Boolean(request.cookies.get(REFRESH_COOKIE)?.value);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", `${pathname}${request.nextUrl.search}`);

  if (PUBLIC_PATHS.has(pathname)) {
    if (signedIn) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  if (!signedIn) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/session/clear|api/session/refresh|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
