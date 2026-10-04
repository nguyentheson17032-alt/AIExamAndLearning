import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { PromotionChallengeCard } from "@/components/promotion-challenge-card";
import { backendFetch } from "@/lib/backend";
import { resolveEloAttemptIds } from "@/lib/elo-history";
import { formatDateTime } from "@/lib/format-datetime";
import { requireUser } from "@/lib/guards";
import type { Attempt, EloEvent, PageResponse, PromotionStatusResponse, UserProfile } from "@/lib/types";
import Link from "next/link";

export default async function MePage() {
  await requireUser();
  const [profile, events, attempts, promotion] = await Promise.all([
    backendFetch<UserProfile>("/api/v1/me"),
    backendFetch<PageResponse<EloEvent>>("/api/v1/me/elo-events?size=30"),
    backendFetch<PageResponse<Attempt>>("/api/v1/attempts?size=100&sort=gradedAt,desc"),
    backendFetch<PromotionStatusResponse>("/api/v1/me/promotion").catch(() => null),
  ]);
  const attemptIds = resolveEloAttemptIds(events.content, attempts.content);
  return (
    <>
      <PageHeader title={profile.displayName} description={`${profile.email} · ${profile.role}`} />
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-line bg-card p-5">
          <p className="text-sm text-muted">Rank Hiện Tại</p>
          <p className="mt-1 text-2xl font-semibold">{profile.rankCode}</p>
        </div>
        <div className="rounded-xl border border-line bg-card p-5">
          <p className="text-sm text-muted">Điểm Elo</p>
          <p className="mt-1 text-2xl font-semibold">{profile.eloRating}</p>
        </div>
      </div>

      <div className="mb-8">
        <PromotionChallengeCard status={promotion} />
      </div>
      <h2 className="mb-3 font-medium">Elo history</h2>
      {events.content.length === 0 ? (
        <EmptyState title="No Elo events yet" description="Submit a practice or exam attempt to change rank." />
      ) : (
        <ul className="space-y-2">
          {events.content.map((event, index) => (
            <li key={event.id}>
              <EloHistoryRow event={event} attemptId={attemptIds[index] ?? null} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function EloHistoryRow({ event, attemptId }: { event: EloEvent; attemptId: string | null }) {
  const body = (
    <>
      <span className="font-medium">
        {event.delta > 0 ? "+" : ""}
        {event.delta}
      </span>{" "}
      {event.ratingBefore} → {event.ratingAfter} · {event.reason} · {event.rankAfter}
      <span className="ml-2 text-muted">{formatDateTime(event.createdAt)}</span>
      {attemptId ? <span className="mt-1 block text-accent">Xem kết quả và lời giải</span> : null}
    </>
  );
  const className = "block rounded-lg border border-line bg-card px-4 py-3 text-sm";
  if (!attemptId) {
    return <div className={className}>{body}</div>;
  }
  return (
    <Link href={`/attempts/${attemptId}`} className={`${className} hover:border-accent`}>
      {body}
    </Link>
  );
}
