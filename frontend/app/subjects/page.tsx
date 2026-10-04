import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { SubjectFilterList } from "@/components/subject-filter-list";
import { backendFetch } from "@/lib/backend";
import { requireUser } from "@/lib/guards";
import { isTeacher } from "@/lib/session";
import type { ClassroomDetail, ClassroomSummary, PageResponse, Subject } from "@/lib/types";
import Link from "next/link";

export default async function SubjectsPage() {
  const user = await requireUser();
  const teacher = isTeacher(user);
  const [page, classrooms] = await Promise.all([
    backendFetch<PageResponse<Subject>>("/api/v1/subjects?size=100"),
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
        description={teacher ? "Chọn môn học để xem bộ đề, quản lý ngân hàng câu hỏi." : "Các môn có bài thi trong lớp của bạn."}
      >
        {teacher ? (
          <Link href="/subjects/new" className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white shadow-xs hover:bg-accent-hover transition-colors">
            + Add Subject
          </Link>
        ) : null}
      </PageHeader>
      {!teacher && classrooms.length === 0 ? (
        <EmptyState title="Chưa có lớp" description="Khi giáo viên thêm bạn vào lớp, môn và bài sẽ hiện ở đây." />
      ) : subjects.length === 0 ? (
        <EmptyState
          title={teacher ? "Chưa có môn học" : "Chưa có bài thi"}
          description={teacher ? "Hãy tạo môn học trước khi thêm đề thi hoặc câu hỏi." : "Các lớp bạn tham gia hiện chưa có đề bài nào."}
        />
      ) : (
        <SubjectFilterList subjects={subjects} isTeacher={teacher} />
      )}
    </>
  );
}

