export function safeInternalPath(path: string | null | undefined): string {
  if (!path?.startsWith("/") || path.startsWith("//") || path.includes("\\")) {
    return "/";
  }
  if (path.startsWith("/api/")) {
    return "/";
  }
  return path;
}
