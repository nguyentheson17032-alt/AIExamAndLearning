import { PageHeader } from "@/components/page-header";
import { requireUser } from "@/lib/guards";
import { PAPER_GROUPS } from "@/lib/paper-groups";
import { isTeacher } from "@/lib/session";
import Link from "next/link";

export default async function PapersPage() {
  const user = await requireUser();
  const teacher = isTeacher(user);

  return (
    <>
      <PageHeader title="Papers" description="Chọn nhóm để xem đề.">
        {teacher ? (
          <>
            <Link href="/papers/new" className="rounded-md bg-accent px-3 py-2 text-sm text-white hover:bg-accent-hover">
              Create paper
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
      <ul className="grid gap-3 sm:grid-cols-2">
        {PAPER_GROUPS.map((group) => (
          <li key={group.id}>
            <Link href={`/papers/group/${group.id}`} className="block rounded-xl border border-line bg-card p-5 hover:border-accent">
              <p className="text-xs text-muted">{group.code}</p>
              <h2 className="mt-1 font-medium">{group.title}</h2>
              <p className="mt-1 text-sm text-muted">{group.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
