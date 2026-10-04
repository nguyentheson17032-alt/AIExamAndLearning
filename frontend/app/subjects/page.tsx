import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { backendFetch } from "@/lib/backend";
import { requireUser } from "@/lib/guards";
import { isTeacher } from "@/lib/session";
import type { ClassroomDetail, ClassroomSummary, PageResponse, Subject } from "@/lib/types";
import Link from "next/link";

export default async function SubjectsPage() {
  const user = await requireUser();
  const teacher = isTeacher(user);
  const [page, classrooms] = await Promise.all([
    backendFetch<PageResponse<Subject>>("/api/v1/subjects?size=50"),
    teacher
      ? Promise.resolve([] as ClassroomSummary[])
      : backendFetch<ClassroomSummary[]>("/api/v1/classrooms").catch(() => [] as ClassroomSummary[]),
  ]);

  let subjects = page.content;

  if (!teacher) {
    const details = await Promise.all(
      classrooms.map((c) => backendFetch<ClassroomDetail>(`/api/v1/classrooms/${c.id}`).catch(() => null)),
    );
    const subjectIds = new Set<string>();
    for (const detail of details) {
      if (detail?.papers) {
        for (const paper of detail.papers) {
          if (paper.subjectId) {
            subjectIds.add(paper.subjectId);
          }
        }
      }
    }
    subjects = page.content.filter((subject) => subjectIds.has(subject.id));
  }

  return (
    <>
      <PageHeader
        title="Subjects"
        description={teacher ? "Chọn môn để xem bộ đề." : "Các môn có bài trong lớp của bạn."}
      >
        {teacher ? (
          <Link href="/subjects/new" className="rounded-md bg-accent px-3 py-2 text-sm text-white hover:bg-accent-hover">
            New subject
          </Link>
        ) : null}
      </PageHeader>
      {!teacher && classrooms.length === 0 ? (
        <EmptyState title="Chưa có lớp" description="Khi giáo viên thêm bạn vào lớp, môn và bài sẽ hiện ở đây." />
      ) : subjects.length === 0 ? (
        <EmptyState
          title={teacher ? "No subjects" : "Chưa có bài"}
          description={teacher ? "Create a subject before adding questions." : "Các lớp bạn tham gia hiện chưa có đề bài nào."}
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {subjects.map((subject) => (
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
