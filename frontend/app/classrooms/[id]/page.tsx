import { AddStudentForm } from "@/components/add-student-form";
import { PageHeader } from "@/components/page-header";
import { RemovePaperButton } from "@/components/remove-paper-button";
import { RenameClassroomForm } from "@/components/rename-classroom-form";
import { RemoveStudentButton } from "@/components/remove-student-button";
import { SharePapersForm } from "@/components/share-papers-form";
import { backendFetch } from "@/lib/backend";
import { requireUser } from "@/lib/guards";
import type { ClassroomDetail, ShareOptions } from "@/lib/types";
import Link from "next/link";

export default async function ClassroomPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const classroom = await backendFetch<ClassroomDetail>(`/api/v1/classrooms/${id}`);
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
          <SharePapersForm classroomId={classroom.id} papers={options.papers} paperSets={options.paperSets} />
        </div>
      ) : null}
      <section className="mb-8">
        <h2 className="mb-3 font-medium">Bài trong lớp</h2>
        {classroom.papers.length === 0 ? (
          <p className="text-sm text-muted">Chưa có bài nào trong lớp.</p>
        ) : (
          <ul className="divide-y divide-line rounded-xl border border-line bg-card">
            {classroom.papers.map((paper) => (
              <li key={paper.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <Link href={`/papers/${paper.id}`} className="min-w-0 flex-1 hover:text-accent">
                  <span className="font-medium">{paper.title}</span>
                  <span className="ml-2 text-sm text-muted">{paper.durationMinutes} phút</span>
                </Link>
                {classroom.teacher ? <RemovePaperButton classroomId={classroom.id} paperId={paper.id} /> : null}
              </li>
            ))}
          </ul>
        )}
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
