"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: 32 }}>
        <h1 style={{ fontSize: 24 }}>Something went wrong</h1>
        <button type="button" onClick={reset} style={{ marginTop: 16 }}>
          Try again
        </button>
      </body>
    </html>
  );
}
