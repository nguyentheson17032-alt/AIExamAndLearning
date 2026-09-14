import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { backendFetch } from "@/lib/backend";
import { formatDateTime } from "@/lib/format-datetime";
import { requireUser } from "@/lib/guards";
import type { EloEvent, PageResponse, UserProfile } from "@/lib/types";

export default async function MePage() {
  await requireUser();
  const [profile, events] = await Promise.all([
    backendFetch<UserProfile>("/api/v1/me"),
    backendFetch<PageResponse<EloEvent>>("/api/v1/me/elo-events?size=30"),
  ]);
  return (
    <>
      <PageHeader title={profile.displayName} description={`${profile.email} · ${profile.role}`} />
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-line bg-card p-5">
          <p className="text-sm text-muted">Rank</p>
          <p className="mt-1 text-2xl font-semibold">{profile.rankCode}</p>
        </div>
        <div className="rounded-xl border border-line bg-card p-5">
          <p className="text-sm text-muted">Elo</p>
          <p className="mt-1 text-2xl font-semibold">{profile.eloRating}</p>
        </div>
      </div>
      <h2 className="mb-3 font-medium">Elo history</h2>
      {events.content.length === 0 ? (
        <EmptyState title="No Elo events yet" description="Submit a practice or exam attempt to change rank." />
      ) : (
        <ul className="space-y-2">
          {events.content.map((event) => (
            <li key={event.id} className="rounded-lg border border-line bg-card px-4 py-3 text-sm">
              <span className="font-medium">
                {event.delta > 0 ? "+" : ""}
                {event.delta}
              </span>{" "}
              {event.ratingBefore} → {event.ratingAfter} · {event.reason} · {event.rankAfter}
              <span className="ml-2 text-muted">{formatDateTime(event.createdAt)}</span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
