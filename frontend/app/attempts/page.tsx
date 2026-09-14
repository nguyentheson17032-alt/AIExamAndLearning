import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { backendFetch } from "@/lib/backend";
import { formatDateTime } from "@/lib/format-datetime";
import { requireUser } from "@/lib/guards";
import type { Attempt, PageResponse } from "@/lib/types";
import Link from "next/link";

export default async function AttemptsPage() {
  await requireUser();
  const page = await backendFetch<PageResponse<Attempt>>("/api/v1/attempts?size=50");
  return (
    <>
      <PageHeader title="Attempts" description="In-progress work and graded results." />
      {page.content.length === 0 ? (
        <EmptyState title="No attempts" description="Start a paper or an Elo practice session." />
      ) : (
        <ul className="space-y-3">
          {page.content.map((attempt) => (
            <li key={attempt.id}>
              <Link href={`/attempts/${attempt.id}`} className="block rounded-xl border border-line bg-card p-5 hover:border-accent">
                <p className="text-xs text-muted">
                  {attempt.status}
                  {attempt.score != null ? ` · ${attempt.score}/${attempt.maxScore}` : ""}
                  {attempt.eloDelta != null ? ` · Elo ${attempt.eloDelta > 0 ? "+" : ""}${attempt.eloDelta}` : ""}
                </p>
                <p className="mt-1 text-sm">Started {formatDateTime(attempt.startedAt)}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
