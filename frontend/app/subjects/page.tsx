import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { backendFetch } from "@/lib/backend";
import { requireUser } from "@/lib/guards";
import { isTeacher } from "@/lib/session";
import type { PageResponse, Subject } from "@/lib/types";
import Link from "next/link";

export default async function SubjectsPage() {
  const user = await requireUser();
  const teacher = isTeacher(user);
  const page = await backendFetch<PageResponse<Subject>>("/api/v1/subjects?size=50");
  return (
    <>
      <PageHeader title="Subjects" description="Chọn môn để xem bộ đề.">
        {teacher ? (
          <Link href="/subjects/new" className="rounded-md bg-accent px-3 py-2 text-sm text-white hover:bg-accent-hover">
            New subject
          </Link>
        ) : null}
      </PageHeader>
      {page.content.length === 0 ? (
        <EmptyState title="No subjects" description="Create a subject before adding questions." />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {page.content.map((subject) => (
            <li key={subject.id}>
              <Link href={`/subjects/${subject.id}`} className="block rounded-xl border border-line bg-card p-5 hover:border-accent">
                <p className="text-xs text-muted">{subject.code}</p>
                <h2 className="mt-1 font-medium">{subject.name}</h2>
                {subject.description ? <p className="mt-1 text-sm text-muted">{subject.description}</p> : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
