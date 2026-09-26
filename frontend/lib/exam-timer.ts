export const LAST_MINUTE_MS = 60_000;

export function remainingMs(startedAt: string, durationMinutes: number, nowMs: number): number {
  const start = Date.parse(startedAt);
  if (Number.isNaN(start)) {
    return 0;
  }
  return Math.max(0, start + durationMinutes * 60_000 - nowMs);
}

export function isLastMinute(remaining: number): boolean {
  return remaining > 0 && remaining <= LAST_MINUTE_MS;
}

export function formatCountdown(remaining: number): string {
  const totalSeconds = Math.ceil(Math.max(0, remaining) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
