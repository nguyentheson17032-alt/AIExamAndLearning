export type EloHistoryMatch = {
  attemptId?: string | null;
  ratingBefore: number;
  ratingAfter: number;
  delta: number;
  createdAt: string;
};

export type EloAttemptMatch = {
  id: string;
  eloBefore: number | null;
  eloAfter: number | null;
  eloDelta: number | null;
  gradedAt: string | null;
};

export function resolveEloAttemptIds(events: EloHistoryMatch[], attempts: EloAttemptMatch[]): Array<string | null> {
  const used = new Set<string>();
  return events.map((event) => {
    if (event.attemptId && !used.has(event.attemptId)) {
      used.add(event.attemptId);
      return event.attemptId;
    }
    const eventTime = Date.parse(event.createdAt);
    let bestId: string | null = null;
    let bestGap = Number.POSITIVE_INFINITY;
    for (const attempt of attempts) {
      if (used.has(attempt.id)) {
        continue;
      }
      if (attempt.eloBefore !== event.ratingBefore || attempt.eloAfter !== event.ratingAfter) {
        continue;
      }
      const graded = attempt.gradedAt ? Date.parse(attempt.gradedAt) : Number.NaN;
      const gap = Number.isNaN(eventTime) || Number.isNaN(graded) ? Number.POSITIVE_INFINITY : Math.abs(graded - eventTime);
      if (gap < bestGap) {
        bestGap = gap;
        bestId = attempt.id;
      }
    }
    if (bestId) {
      used.add(bestId);
    }
    return bestId;
  });
}
