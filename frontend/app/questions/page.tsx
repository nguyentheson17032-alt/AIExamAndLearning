import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { backendFetch } from "@/lib/backend";
import { requireTeacher } from "@/lib/guards";
import type { PageResponse, Question } from "@/lib/types";
import Link from "next/link";

export default async function QuestionsPage() {
  await requireTeacher();
  const page = await backendFetch<PageResponse<Question>>("/api/v1/questions?size=50");
  return (
    <>
      <PageHeader title="Question bank" description="Create, upload, classify, and archive questions.">
        <Link href="/questions/new" className="rounded-md bg-accent px-3 py-2 text-sm text-white hover:bg-accent-hover">
          New question
        </Link>
        <Link href="/questions/upload" className="rounded-md border border-line px-3 py-2 text-sm hover:border-accent">
          Batch upload
        </Link>
      </PageHeader>
      {page.content.length === 0 ? (
        <EmptyState title="No questions" description="Add a question or upload a JSON batch." />
      ) : (
        <ul className="space-y-3">
          {page.content.map((question) => (
            <li key={question.id}>
              <Link href={`/questions/${question.id}`} className="block rounded-xl border border-line bg-card p-5 hover:border-accent">
                <p className="text-xs text-muted">
                  {question.type} · {question.difficulty} · Elo {question.eloRating} · {question.status}
                </p>
                <p className="mt-1">{question.stem.slice(0, 180)}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
