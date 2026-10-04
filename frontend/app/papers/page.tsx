import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { backendFetch } from "@/lib/backend";
import { requireUser } from "@/lib/guards";
import { groupPapers, PAPER_GROUPS, setTitlesById } from "@/lib/paper-groups";
import { isTeacher } from "@/lib/session";
import type { ClassroomSummary, PageResponse, Paper, PaperSet } from "@/lib/types";
import Link from "next/link";

export default async function PapersPage() {
  const user = await requireUser();
  const teacher = isTeacher(user);
  const classrooms = teacher ? [] : await backendFetch<ClassroomSummary[]>("/api/v1/classrooms");
  const [allPapersPage, sets] = await Promise.all([
    backendFetch<PageResponse<Paper>>("/api/v1/papers?size=200").catch(() => null),
    backendFetch<PaperSet[]>("/api/v1/paper-sets").catch(() => [] as PaperSet[]),
  ]);
  const allPapers = allPapersPage?.content || [];
  const grouped = allPapers.length > 0 ? groupPapers(allPapers, setTitlesById(sets)) : null;
  const groups = grouped ? PAPER_GROUPS.filter((group) => grouped[group.id].length > 0) : PAPER_GROUPS;

  return (
    <>
      <PageHeader title="Papers" description={teacher ? "Chọn nhóm để xem đề hoặc chọn làm bài ngay bên dưới." : "Bài trong lớp và đề luyện tập của bạn."}>
        {teacher ? (
          <>
            <Link href="/papers/new" className="rounded-md bg-accent px-3 py-2 text-sm text-white hover:bg-accent-hover">
              Tạo đề
            </Link>
            <Link href="/papers/generate" className="rounded-md border border-line px-3 py-2 text-sm hover:border-accent">
              Generate
            </Link>
            <Link href="/papers/ai" className="rounded-md border border-line px-3 py-2 text-sm hover:border-accent">
              AI practice
            </Link>
          </>
        ) : null}
      </PageHeader>
      {!teacher && classrooms.length === 0 && allPapers.length === 0 ? (
        <EmptyState title="Chưa có lớp" description="Khi giáo viên thêm bạn vào lớp hoặc khi sinh đề AI, bài sẽ hiện ở đây." />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {groups.map((group) => (
            <li key={group.id}>
              <Link href={`/papers/group/${group.id}`} className="block rounded-xl border border-line bg-card p-5 hover:border-accent">
                <p className="text-xs text-muted">{group.code}</p>
                <h2 className="mt-1 font-medium">{group.title}</h2>
                <p className="mt-1 text-sm text-muted">{group.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}


    </>
  );
}
