import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { backendFetch } from "@/lib/backend";
import { requireUser } from "@/lib/guards";
import { groupPapers, PAPER_GROUPS, setTitlesById } from "@/lib/paper-groups";
import { isTeacher } from "@/lib/session";
import type { ClassroomDetail, ClassroomSummary, PageResponse, Paper, PaperSet, Subject } from "@/lib/types";
import Link from "next/link";

export default async function SubjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const teacher = isTeacher(user);
  const { id } = await params;
  const [subject, sets, classrooms, classPaperPage] = await Promise.all([
    backendFetch<Subject>(`/api/v1/subjects/${id}`),
    backendFetch<PaperSet[]>(`/api/v1/paper-sets?subjectId=${id}`),
    backendFetch<ClassroomSummary[]>("/api/v1/classrooms"),
    teacher
      ? Promise.resolve(null)
      : backendFetch<PageResponse<Paper>>(`/api/v1/papers?subjectId=${id}&size=200`),
  ]);
  const classPapers = teacher ? await classPapersForSubject(classrooms, id) : [];
  const groupedStudentPapers = teacher ? null : groupPapers(classPaperPage?.content ?? [], setTitlesById(sets));
  const studentGroups = groupedStudentPapers
    ? PAPER_GROUPS.filter((group) => groupedStudentPapers[group.id].length > 0)
    : [];

  return (
    <>
      <PageHeader title={subject.name} description={subject.description ?? subject.code}>
        {teacher ? (
          <Link href={`/subjects/${id}/upload`} className="rounded-md bg-accent px-3 py-2 text-sm text-white hover:bg-accent-hover">
            Tải đề
          </Link>
        ) : null}
      </PageHeader>
      {!teacher && classrooms.length === 0 ? (
        <EmptyState title="Chưa có lớp" description="Khi giáo viên thêm bạn vào lớp, bài của môn này sẽ hiện ở đây." />
      ) : !teacher ? (
        studentGroups.length === 0 ? (
          <EmptyState title="Chưa có bài" description="Bài giáo viên đưa vào lớp sẽ hiện ở đây." />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {studentGroups.map((group) => (
              <li key={group.id}>
                <Link
                  href={`/papers/group/${group.id}?subjectId=${id}`}
                  className="block rounded-xl border border-line bg-card p-5 hover:border-accent"
                >
                  <p className="text-xs text-muted">{group.code}</p>
                  <h2 className="mt-1 font-medium">{group.title}</h2>
                  <p className="mt-1 text-sm text-muted">{group.description}</p>
                </Link>
              </li>
            ))}
          </ul>
        )
      ) : (
        <>
          {teacher ? (
            <section className="mb-8">
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
          ) : null}
          {!teacher || classrooms.length > 0 ? (
            <section>
              {teacher ? <h2 className="mb-3 font-medium">Bài trong lớp</h2> : null}
              {classPapers.length === 0 ? (
                <EmptyState title="Chưa có bài" description="Bài giáo viên đưa vào lớp sẽ hiện ở đây." />
              ) : (
                <ul className="space-y-3">
                  {classPapers.map((paper) => (
                    <li key={paper.id}>
                      <Link href={`/papers/${paper.id}`} className="block rounded-xl border border-line bg-card p-5 hover:border-accent">
                        <p className="text-xs text-muted">{paper.kind} · {paper.durationMinutes} phút</p>
                        <h3 className="mt-1 font-medium">{paper.title}</h3>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ) : null}
        </>
      )}
    </>
  );
}

async function classPapersForSubject(classrooms: ClassroomSummary[], subjectId: string) {
  const details = await Promise.all(
    classrooms.map((classroom) => backendFetch<ClassroomDetail>(`/api/v1/classrooms/${classroom.id}`)),
  );
  const seen = new Set<string>();
  return details.flatMap((detail) =>
    detail.papers.filter((paper) => {
      if (paper.subjectId !== subjectId || seen.has(paper.id)) {
        return false;
      }
      seen.add(paper.id);
      return true;
    }),
  );
}
