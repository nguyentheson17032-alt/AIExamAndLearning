import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { StartAttemptButton } from "@/components/start-attempt-button";
import { backendFetch } from "@/lib/backend";
import { requireUser } from "@/lib/guards";
import type { PaperSet } from "@/lib/types";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function SubjectPaperSetPage({
  params,
}: {
  params: Promise<{ id: string; setId: string }>;
}) {
  await requireUser();
  const { id, setId } = await params;
  const set = await backendFetch<PaperSet>(`/api/v1/paper-sets/${setId}`);
  if (set.subjectId !== id) {
    notFound();
  }
  return (
    <>
      <PageHeader
        title={set.title}
        description={`${set.academicYear ?? ""} · ${set.paperCount} đề · thang điểm 10, Elo + điểm đạt được`.trim()}
      />
      <p className="mb-6 text-sm">
        <Link href={`/subjects/${id}`} className="text-accent hover:underline">
          ← Quay lại môn học
        </Link>
      </p>
      {set.description ? <p className="mb-6 text-sm text-muted">{set.description}</p> : null}
      {set.papers.length === 0 ? (
        <EmptyState title="Bộ đề trống" description="Chưa có đề nào trong bộ này." />
      ) : (
        <ol className="space-y-3">
          {set.papers.map((paper) => (
            <li
              key={paper.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-card p-5"
            >
              <div>
                <p className="text-xs text-muted">
                  Đề số {paper.examNumber ?? "—"} · {paper.durationMinutes} phút · {paper.questionCount} câu
                </p>
                <h2 className="mt-1 font-medium">{paper.title}</h2>
              </div>
              <StartAttemptButton paperId={paper.id} />
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
