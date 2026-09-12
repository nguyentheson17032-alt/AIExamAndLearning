import { PageHeader } from "@/components/page-header";
import { backendFetch } from "@/lib/backend";
import { requireUser } from "@/lib/guards";
import { isTeacher } from "@/lib/session";
import type { Attempt, PageResponse, Paper, UserProfile } from "@/lib/types";
import Link from "next/link";

export default async function HomePage() {
  const user = await requireUser();
  const teacher = isTeacher(user);
  const [profile, papers, attempts] = await Promise.all([
    backendFetch<UserProfile>("/api/v1/me"),
    backendFetch<PageResponse<Paper>>("/api/v1/papers?size=5"),
    backendFetch<PageResponse<Attempt>>("/api/v1/attempts?size=5"),
  ]);

  return (
    <>
      <PageHeader
        title={`Hello, ${profile.displayName}`}
        description={`${profile.rankCode} · Elo ${profile.eloRating} · ${profile.role}`}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/practice" className="rounded-xl border border-line bg-card p-5 hover:border-accent">
          <h2 className="font-medium">Practice by Elo</h2>
          <p className="mt-1 text-sm text-muted">Adaptive set matched to your current rating.</p>
        </Link>
        <Link href="/papers" className="rounded-xl border border-line bg-card p-5 hover:border-accent">
          <h2 className="font-medium">Papers</h2>
          <p className="mt-1 text-sm text-muted">{papers.totalElements} exams, assignments, and practice sets.</p>
        </Link>
        <Link href="/me" className="rounded-xl border border-line bg-card p-5 hover:border-accent">
          <h2 className="font-medium">Rank history</h2>
          <p className="mt-1 text-sm text-muted">{attempts.totalElements} attempts recorded.</p>
        </Link>
      </div>
      {teacher ? (
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <Link href="/questions/new" className="rounded-md bg-accent px-3 py-2 text-white hover:bg-accent-hover">
            New question
          </Link>
          <Link href="/papers/generate" className="rounded-md border border-line px-3 py-2 hover:border-accent">
            Generate paper
          </Link>
          <Link href="/subjects/new" className="rounded-md border border-line px-3 py-2 hover:border-accent">
            New subject
          </Link>
        </div>
      ) : null}
    </>
  );
}
