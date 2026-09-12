import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { backendFetch } from "@/lib/backend";
import { requireUser } from "@/lib/guards";
import type { PaperSet } from "@/lib/types";
import Link from "next/link";

export default async function ExamSetsPage() {
  await requireUser();
  const sets = await backendFetch<PaperSet[]>("/api/v1/paper-sets");
  return (
    <>
      <PageHeader
        title="Bộ đề"
        description="Chọn một bộ đề để xem từng đề và làm bài theo từng câu."
      />
      {sets.length === 0 ? (
        <EmptyState title="Chưa có bộ đề" description="Giáo viên import bộ đề Toán tuyển sinh 10 để học sinh luyện." />
      ) : (
        <ul className="space-y-3">
          {sets.map((set) => (
            <li key={set.id}>
              <Link href={`/exam-sets/${set.id}`} className="block rounded-xl border border-line bg-card p-5 hover:border-accent">
                <p className="text-xs text-muted">
                  {set.academicYear ?? "Năm học"} · {set.paperCount} đề
                </p>
                <h2 className="mt-1 font-medium">{set.title}</h2>
                {set.description ? <p className="mt-1 text-sm text-muted">{set.description}</p> : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
