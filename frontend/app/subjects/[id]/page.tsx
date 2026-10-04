import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { backendFetch } from "@/lib/backend";
import { requireUser } from "@/lib/guards";
import { isTeacher } from "@/lib/session";
import type { ClassroomDetail, ClassroomSummary, PaperSet, Subject } from "@/lib/types";
import Link from "next/link";

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
      <PageHeader title={subject.name} description={subject.description ?? subject.code}>
        {teacher ? (
          <Link href={`/subjects/${id}/upload`} className="rounded-md bg-accent px-3 py-2 text-sm text-white hover:bg-accent-hover">
            Tải đề
          </Link>
        ) : null}
      </PageHeader>

      {teacher ? (
        <>
          {/* Giao diện dành cho Giáo viên */}
          <section className="mb-8">
            <h2 className="mb-3 font-semibold text-base">📁 Bộ đề môn {subject.name} ({sets.length})</h2>
            {sets.length === 0 ? (
              <EmptyState title="Chưa có bộ đề" description="Khi sinh đề AI hoặc tạo bộ đề, các bộ đề của môn này sẽ hiển thị tại đây." />
            ) : (
              <ul className="space-y-3">
                {sets.map((set) => (
                  <li key={set.id}>
                    <Link
                      href={`/subjects/${id}/sets/${set.id}`}
                      className="block rounded-xl border border-line bg-card p-5 hover:border-accent transition"
                    >
                      <p className="text-xs text-muted">
                        {set.academicYear ?? "Năm học"} · {set.paperCount} đề thi
                      </p>
                      <h3 className="mt-1 font-medium">{set.title}</h3>
                      {set.description ? <p className="mt-1 text-sm text-muted">{set.description}</p> : null}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {classrooms.length > 0 && classPapersWithClass.length > 0 && (
            <section>
              <h2 className="mb-3 font-medium">Bài trong lớp</h2>
              <ul className="space-y-3">
                {classPapersWithClass.map((paper) => (
                  <li key={paper.id}>
                    <Link href={`/papers/${paper.id}`} className="block rounded-xl border border-line bg-card p-5 hover:border-accent">
                      <p className="text-xs text-muted">{paper.kind} · {paper.durationMinutes} phút · Lớp {paper.className}</p>
                      <h3 className="mt-1 font-medium">{paper.title}</h3>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      ) : (
        /* Giao diện dành cho Học sinh: CHỈ hiển thị các đề được giao trong lớp */
        <section>
          <h2 className="mb-3 font-semibold text-base">📝 Đề thi trong lớp học ({classPapersWithClass.length})</h2>
          {classrooms.length === 0 ? (
            <EmptyState
              title="Chưa tham gia lớp học"
              description="Bạn chưa tham gia lớp học nào. Hãy liên hệ giáo viên để được thêm vào lớp."
            />
          ) : classPapersWithClass.length === 0 ? (
            <EmptyState
              title="Chưa có đề thi"
              description="Giáo viên chưa giao đề thi nào cho môn học này trong các lớp của bạn."
            />
          ) : (
            <ul className="space-y-3">
              {classPapersWithClass.map((paper) => (
                <li key={paper.id}>
                  <Link
                    href={`/papers/${paper.id}`}
                    className="block rounded-xl border border-line bg-card p-5 hover:border-accent transition"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs text-muted">
                        Lớp: <span className="font-medium text-foreground">{paper.className}</span> · {paper.durationMinutes} phút · {paper.kind}
                      </p>
                      <span className="rounded bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
                        GV: {paper.teacherName}
                      </span>
                    </div>
                    <h3 className="mt-2 text-base font-semibold text-foreground">{paper.title}</h3>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </>
  );
}
