import { ACCESS_COOKIE } from "@/lib/session";
import { BACKEND_URL } from "@/lib/backend";
import { NextRequest, NextResponse } from "next/server";

const UUID = /^[0-9a-fA-F-]{36}$/;

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!UUID.test(id)) {
    return new NextResponse(null, { status: 404 });
  }
  const token = request.cookies.get(ACCESS_COOKIE)?.value;
  const headers = new Headers();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const response = await fetch(`${BACKEND_URL}/api/v1/question-images/${id}`, {
    headers,
    cache: "no-store",
  });
  if (!response.ok) {
    return new NextResponse(null, { status: response.status });
  }
  const body = await response.arrayBuffer();
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": response.headers.get("Content-Type") ?? "image/png",
      "Cache-Control": "private, max-age=86400",
    },
  });
}
