import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { backendFetch } from "@/lib/backend";
import { requireUser } from "@/lib/guards";
import { PAPER_GROUPS, groupPapers } from "@/lib/paper-groups";
import { isTeacher } from "@/lib/session";
import type { PageResponse, Paper, PaperSet } from "@/lib/types";
import Link from "next/link";

export default async function PapersPage() {
  const user = await requireUser();
  const teacher = isTeacher(user);
  const [page, sets] = await Promise.all([
    backendFetch<PageResponse<Paper>>("/api/v1/papers?size=200"),
    backendFetch<PaperSet[]>("/api/v1/paper-sets"),
  ]);
  const setTitleById = new Map(sets.map((set) => [set.id, `${set.title} ${set.description ?? ""}`]));
  const grouped = groupPapers(page.content, setTitleById);

  return (
    <>
      <PageHeader title="Papers" description="Đề tuyển sinh, đề TNTHPT, đề practice và đề question.">
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
      <nav className="mb-8 flex flex-wrap gap-2">
        {PAPER_GROUPS.map((group) => (
          <a
            key={group.id}
            href={`#${group.id}`}
            className="rounded-full border border-line bg-card px-3 py-1.5 text-sm hover:border-accent"
          >
            {group.title}
            <span className="ml-2 text-muted">{grouped[group.id].length}</span>
          </a>
        ))}
      </nav>
      <div className="space-y-10">
        {PAPER_GROUPS.map((group) => {
          const papers = grouped[group.id];
          return (
            <section key={group.id} id={group.id} className="scroll-mt-6">
              <h2 className="text-lg font-semibold">{group.title}</h2>
              <p className="mt-1 text-sm text-muted">{group.description}</p>
              {papers.length === 0 ? (
                <div className="mt-4">
                  <EmptyState title="Chưa có đề" description="Nhóm này chưa có đề nào." />
                </div>
              ) : (
                <ul className="mt-4 space-y-3">
                  {papers.map((paper) => (
                    <li key={paper.id}>
                      <Link href={`/papers/${paper.id}`} className="block rounded-xl border border-line bg-card p-5 hover:border-accent">
                        <p className="text-xs text-muted">
                          {paper.kind} · {paper.durationMinutes} min · Elo {paper.targetEloMin}–{paper.targetEloMax}
                        </p>
                        <h3 className="mt-1 font-medium">{paper.title}</h3>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
