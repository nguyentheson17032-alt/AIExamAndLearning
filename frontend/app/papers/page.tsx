import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { backendFetch } from "@/lib/backend";
import { requireUser } from "@/lib/guards";
import { isTeacher } from "@/lib/session";
import type { PageResponse, Paper } from "@/lib/types";
import Link from "next/link";

export default async function PapersPage() {
  const user = await requireUser();
  const teacher = isTeacher(user);
  const page = await backendFetch<PageResponse<Paper>>("/api/v1/papers?size=50");
  return (
    <>
      <PageHeader title="Papers" description="Exams, assignments, and practice sets.">
        {teacher ? (
          <>
            <Link href="/papers/new" className="rounded-md bg-accent px-3 py-2 text-sm text-white hover:bg-accent-hover">
              Create paper
            </Link>
            <Link href="/papers/generate" className="rounded-md border border-line px-3 py-2 text-sm hover:border-accent">
              Generate
            </Link>
            <Link href="/papers/ai" className="rounded-md border border-line px-3 py-2 text-sm hover:border-accent">
              AI practice
            </Link>
          </>
        ) : null}
      </PageHeader>
      {page.content.length === 0 ? (
        <EmptyState title="No papers" description="Teachers can create or generate a paper." />
      ) : (
        <ul className="space-y-3">
          {page.content.map((paper) => (
            <li key={paper.id}>
              <Link href={`/papers/${paper.id}`} className="block rounded-xl border border-line bg-card p-5 hover:border-accent">
                <p className="text-xs text-muted">
                  {paper.kind} · {paper.durationMinutes} min · Elo {paper.targetEloMin}–{paper.targetEloMax}
                </p>
                <h2 className="mt-1 font-medium">{paper.title}</h2>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
