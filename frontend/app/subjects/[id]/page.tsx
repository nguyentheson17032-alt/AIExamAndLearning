import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { backendFetch } from "@/lib/backend";
import { requireUser } from "@/lib/guards";
import { isTeacher } from "@/lib/session";
import type { PaperSet, Subject } from "@/lib/types";
import Link from "next/link";

export default async function SubjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const teacher = isTeacher(user);
  const { id } = await params;
  const [subject, sets] = await Promise.all([
    backendFetch<Subject>(`/api/v1/subjects/${id}`),
    backendFetch<PaperSet[]>(`/api/v1/paper-sets?subjectId=${id}`),
  ]);
  return (
    <>
      <PageHeader title={subject.name} description={subject.description ?? subject.code}>
        {teacher ? (
          <Link href={`/subjects/${id}/upload`} className="rounded-md bg-accent px-3 py-2 text-sm text-white hover:bg-accent-hover">
            Tải đề
          </Link>
        ) : null}
      </PageHeader>
      <section>
        {sets.length === 0 ? (
          <EmptyState title="Chưa có bộ đề" description="Bộ đề thuộc môn này sẽ hiện ở đây." />
        ) : (
          <ul className="space-y-3">
            {sets.map((set) => (
              <li key={set.id}>
                <Link
                  href={`/subjects/${id}/sets/${set.id}`}
                  className="block rounded-xl border border-line bg-card p-5 hover:border-accent"
                >
                  <p className="text-xs text-muted">
                    {set.academicYear ?? "Năm học"} · {set.paperCount} đề
                  </p>
                  <h3 className="mt-1 font-medium">{set.title}</h3>
                  {set.description ? <p className="mt-1 text-sm text-muted">{set.description}</p> : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
