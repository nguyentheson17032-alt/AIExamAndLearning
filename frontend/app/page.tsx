import { PageHeader } from "@/components/page-header";
import { backendFetch } from "@/lib/backend";
import { requireUser } from "@/lib/guards";
import { isTeacher } from "@/lib/session";
import type { Attempt, PageResponse, Paper, Subject, UserProfile } from "@/lib/types";
import Link from "next/link";

export default async function HomePage() {
  const user = await requireUser();
  const teacher = isTeacher(user);
  const [profile, subjects, papers, attempts] = await Promise.all([
    backendFetch<UserProfile>("/api/v1/me"),
    teacher
      ? backendFetch<PageResponse<Subject>>("/api/v1/subjects?size=1")
      : Promise.resolve(null),
    backendFetch<PageResponse<Paper>>(teacher ? "/api/v1/papers?size=1" : "/api/v1/papers?size=200"),
    backendFetch<PageResponse<Attempt>>("/api/v1/attempts?size=5"),
  ]);
  const subjectCount = teacher
    ? (subjects?.totalElements ?? 0)
    : new Set(papers.content.map((paper) => paper.subjectId)).size;

  return (
    <>
      <PageHeader
        title={`Hello, ${profile.displayName}`}
        description={`${profile.rankCode} · Elo ${profile.eloRating} · ${profile.role}`}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/subjects" className="rounded-xl border border-line bg-card p-5 hover:border-accent">
          <h2 className="font-medium">Subjects</h2>
          <p className="mt-1 text-sm text-muted">{subjectCount} subjects.</p>
        </Link>
        <Link href="/classrooms" className="rounded-xl border border-line bg-card p-5 hover:border-accent">
          <h2 className="font-medium">Classes</h2>
          <p className="mt-1 text-sm text-muted">
            {teacher ? "Add students and share papers." : "Papers from your classes."}
          </p>
        </Link>
        <Link href="/me" className="rounded-xl border border-line bg-card p-5 hover:border-accent">
          <h2 className="font-medium">Rank history</h2>
          <p className="mt-1 text-sm text-muted">{attempts.totalElements} attempts recorded.</p>
        </Link>
      </div>
    </>
  );
}
