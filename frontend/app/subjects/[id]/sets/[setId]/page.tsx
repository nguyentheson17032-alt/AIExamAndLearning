import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { PaperSetFilterList } from "@/components/paper-set-filter-list";
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
        <Link href={`/subjects/${id}`} className="text-accent hover:underline font-medium">
          ← Quay lại môn học
        </Link>
      </p>
      {set.description ? <p className="mb-6 text-sm text-muted">{set.description}</p> : null}
      {set.papers.length === 0 ? (
        <EmptyState title="Bộ đề trống" description="Chưa có đề nào trong bộ này." />
      ) : (
        <PaperSetFilterList papers={set.papers} />
      )}
    </>
  );
}

