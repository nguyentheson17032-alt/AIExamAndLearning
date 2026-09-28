import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { backendFetch } from "@/lib/backend";
import { requireUser } from "@/lib/guards";
import { isTeacher } from "@/lib/session";
import type { ClassroomSummary } from "@/lib/types";
import Link from "next/link";

export default async function ClassroomsPage() {
  const user = await requireUser();
  const teacher = isTeacher(user);
  const classrooms = await backendFetch<ClassroomSummary[]>("/api/v1/classrooms");

  return (
    <>
      <PageHeader
        title="Lớp học"
        description={
          teacher
            ? "Tạo lớp, thêm học sinh bằng display name, rồi đưa bài bạn đã tạo vào lớp."
            : "Các lớp giáo viên đã thêm bạn. Mở lớp để xem bài."
        }
      >
        {teacher ? (
          <Link href="/classrooms/new" className="rounded-md bg-accent px-3 py-2 text-sm text-white hover:bg-accent-hover">
            Tạo lớp
          </Link>
        ) : null}
      </PageHeader>
      {classrooms.length === 0 ? (
        <EmptyState
          title={teacher ? "Chưa có lớp" : "Bạn chưa được thêm vào lớp nào"}
          description={
            teacher
              ? "Tạo một lớp, rồi thêm học sinh theo đúng display name lúc đăng ký."
              : "Khi giáo viên thêm display name của bạn, bài của lớp sẽ hiện ở đây."
          }
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {classrooms.map((classroom) => (
            <li key={classroom.id}>
              <Link href={`/classrooms/${classroom.id}`} className="block rounded-xl border border-line bg-card p-5 hover:border-accent">
                <h2 className="font-medium">{classroom.name}</h2>
                <p className="mt-1 text-sm text-muted">
                  {classroom.teacherName} · {classroom.memberCount} học sinh
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
