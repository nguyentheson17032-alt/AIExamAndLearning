import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { backendFetch } from "@/lib/backend";
import { requireUser } from "@/lib/guards";
import { groupPapers, paperGroupById } from "@/lib/paper-groups";
import type { PageResponse, Paper, PaperSet } from "@/lib/types";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function PaperGroupPage({ params }: { params: Promise<{ group: string }> }) {
  await requireUser();
  const { group: groupId } = await params;
  const group = paperGroupById(groupId);
  if (!group) {
    notFound();
  }

  const [page, sets] = await Promise.all([
    backendFetch<PageResponse<Paper>>("/api/v1/papers?size=200"),
    backendFetch<PaperSet[]>("/api/v1/paper-sets"),
  ]);
  const setTitleById = new Map(sets.map((set) => [set.id, `${set.title} ${set.description ?? ""}`]));
  const papers = groupPapers(page.content, setTitleById)[group.id];

  return (
    <>
      <PageHeader title={group.title} description={group.description} />
      {papers.length === 0 ? (
        <EmptyState title="Chưa có đề" description="Nhóm này chưa có đề nào." />
      ) : (
        <ul className="space-y-3">
          {papers.map((paper) => (
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
