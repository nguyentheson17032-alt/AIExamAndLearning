import { ACCESS_COOKIE, REFRESH_COOKIE, USER_COOKIE } from "@/lib/session";
import { NextResponse } from "next/server";

function expireCookie() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  };
}

export function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  const expired = expireCookie();
  response.cookies.set(ACCESS_COOKIE, "", expired);
  response.cookies.set(REFRESH_COOKIE, "", expired);
  response.cookies.set(USER_COOKIE, "", expired);
  return response;
}
