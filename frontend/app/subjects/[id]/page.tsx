import { PageHeader } from "@/components/page-header";
import { SubjectDetailFilter } from "@/components/subject-detail-filter";
import { backendFetch } from "@/lib/backend";
import { requireUser } from "@/lib/guards";
import { isTeacher } from "@/lib/session";
import type { ClassroomDetail, ClassroomSummary, PaperSet, Subject } from "@/lib/types";

export default async function SubjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const teacher = isTeacher(user);
  const { id } = await params;

  const [subject, sets, classrooms] = await Promise.all([
    backendFetch<Subject>(`/api/v1/subjects/${id}`),
    teacher
      ? backendFetch<PaperSet[]>(`/api/v1/paper-sets?subjectId=${id}`).catch(() => [] as PaperSet[])
      : Promise.resolve([] as PaperSet[]),
    backendFetch<ClassroomSummary[]>("/api/v1/classrooms").catch(() => [] as ClassroomSummary[]),
  ]);

  const classroomDetails = await Promise.all(
    classrooms.map((c) => backendFetch<ClassroomDetail>(`/api/v1/classrooms/${c.id}`).catch(() => null)),
  );

  // Danh sách các đề trong lớp thuộc môn học này
  const classPapersWithClass = classroomDetails
    .filter((d): d is ClassroomDetail => d !== null)
    .flatMap((d) =>
      d.papers
        .filter((p) => p.subjectId === id)
        .map((p) => ({ ...p, className: d.name, teacherName: d.teacherName })),
    );

  return (
    <>
      <PageHeader title={subject.name} description={subject.description ?? subject.code} />

      <SubjectDetailFilter
        subjectId={id}
        subjectName={subject.name}
        isTeacher={teacher}
        sets={sets}
        classPapers={classPapersWithClass}
        hasNoClassrooms={!teacher && classrooms.length === 0}
      />
    </>
  );
}

