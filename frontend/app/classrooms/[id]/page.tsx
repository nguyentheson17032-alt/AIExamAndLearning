import { AddStudentForm } from "@/components/add-student-form";
import { ClassroomPapersList } from "@/components/classroom-papers-list";
import { PageHeader } from "@/components/page-header";
import { RenameClassroomForm } from "@/components/rename-classroom-form";
import { RemoveStudentButton } from "@/components/remove-student-button";
import { SharePapersForm } from "@/components/share-papers-form";
import { backendFetch } from "@/lib/backend";
import { requireUser } from "@/lib/guards";
import type { ClassroomDetail, PageResponse, ShareOptions, Subject } from "@/lib/types";

export default async function ClassroomPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const [classroom, subjectsPage] = await Promise.all([
    backendFetch<ClassroomDetail>(`/api/v1/classrooms/${id}`),
    backendFetch<PageResponse<Subject>>("/api/v1/subjects?size=100").catch(() => null),
  ]);
  const subjects = subjectsPage?.content ?? [];
  const options = classroom.teacher
    ? await backendFetch<ShareOptions>(`/api/v1/classrooms/${id}/papers/available`)
    : null;

  return (
    <>
      <PageHeader
        title={
          classroom.teacher ? (
            <RenameClassroomForm classroomId={classroom.id} name={classroom.name} />
          ) : (
            classroom.name
          )
        }
        description={
          classroom.teacher
            ? "Thêm học sinh bằng display name. Bài đưa vào lớp chỉ hiện với học sinh trong lớp."
            : `${classroom.teacherName} · Các bài của lớp`
        }
      />
      {classroom.teacher && options ? (
        <div className="mb-8 grid items-start gap-4 lg:grid-cols-2">
          <AddStudentForm classroomId={classroom.id}>
            <MemberList classroom={classroom} inset />
          </AddStudentForm>
          <SharePapersForm classroomId={classroom.id} papers={options.papers} paperSets={options.paperSets} subjects={subjects} />
        </div>
      ) : null}
      <section className="mb-8">
        <h2 className="mb-3 font-medium">Bài trong lớp</h2>
        <ClassroomPapersList
          classroomId={classroom.id}
          isTeacher={classroom.teacher}
          papers={classroom.papers}
          subjects={subjects}
        />
      </section>
      {classroom.teacher ? null : <MemberList classroom={classroom} />}
    </>
  );
}

function MemberList({ classroom, inset = false }: { classroom: ClassroomDetail; inset?: boolean }) {
  return (
    <section>
      <h2 className="mb-3 font-medium">Học sinh</h2>
      {classroom.members.length === 0 ? (
        <p className="text-sm text-muted">Chưa có học sinh.</p>
      ) : (
        <ul className={inset ? "divide-y divide-line border-t border-line" : "divide-y divide-line rounded-xl border border-line bg-card"}>
          {classroom.members.map((member) => (
            <li key={member.studentId} className={inset ? "flex items-center justify-between gap-4 py-3" : "flex items-center justify-between gap-4 px-4 py-3"}>
              <span>{member.displayName}</span>
              {classroom.teacher ? (
                <RemoveStudentButton classroomId={classroom.id} studentId={member.studentId} />
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
