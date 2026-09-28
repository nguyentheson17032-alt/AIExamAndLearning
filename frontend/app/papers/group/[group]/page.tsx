import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { backendFetch } from "@/lib/backend";
import { requireUser } from "@/lib/guards";
import { groupPapers, paperGroupById, paperOrderLabel, setTitlesById } from "@/lib/paper-groups";
import { isTeacher } from "@/lib/session";
import type { ClassroomSummary, PageResponse, Paper, PaperSet } from "@/lib/types";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function PaperGroupPage({
  params,
  searchParams,
}: {
  params: Promise<{ group: string }>;
  searchParams: Promise<{ subjectId?: string }>;
}) {
  const user = await requireUser();
  const teacher = isTeacher(user);
  const { group: groupId } = await params;
  const { subjectId } = await searchParams;
  const group = paperGroupById(groupId);
  if (!group) {
    notFound();
  }

  const classrooms = teacher ? [] : await backendFetch<ClassroomSummary[]>("/api/v1/classrooms");
  if (!teacher && classrooms.length === 0) {
    return (
      <>
        <PageHeader title={group.title} description={group.description} />
        <EmptyState title="Chưa có lớp" description="Khi giáo viên thêm bạn vào lớp, bài sẽ hiện ở đây." />
      </>
    );
  }

  const [page, sets] = await Promise.all([
    backendFetch<PageResponse<Paper>>("/api/v1/papers?size=200"),
    backendFetch<PaperSet[]>("/api/v1/paper-sets"),
  ]);
  const papers = groupPapers(page.content, setTitlesById(sets))[group.id].filter((paper) =>
    subjectId ? paper.subjectId === subjectId : true,
  );

  return (
    <>
      <PageHeader title={group.title} description={group.description} />
      {papers.length === 0 ? (
        <EmptyState title="Chưa có đề" description="Nhóm này chưa có đề nào." />
      ) : (
        <ul className="space-y-3">
          {papers.map((paper, index) => {
            const label = paperOrderLabel(index + 1);
            return (
              <li key={paper.id}>
                <Link href={`/papers/${paper.id}`} className="block rounded-xl border border-line bg-card p-5 hover:border-accent">
                  <p className="text-xs text-muted">
                    {paper.kind} · {paper.durationMinutes} min · Elo {paper.targetEloMin}–{paper.targetEloMax}
                  </p>
                  <h2 className="mt-1 font-medium">{label}</h2>
                  {paper.title === label ? null : <p className="mt-1 text-sm text-muted">{paper.title}</p>}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
