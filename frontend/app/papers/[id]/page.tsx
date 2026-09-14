import { PageHeader } from "@/components/page-header";
import { StartAttemptButton } from "@/components/start-attempt-button";
import { StemText, promptStem } from "@/components/stem-text";
import { backendFetch } from "@/lib/backend";
import { requireUser } from "@/lib/guards";
import { isTeacher } from "@/lib/session";
import type { Paper } from "@/lib/types";

export default async function PaperDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const paper = await backendFetch<Paper>(`/api/v1/papers/${id}`);
  const items = paper.questions.toSorted((a, b) => a.sortOrder - b.sortOrder);
  const teacher = isTeacher(user);
  return (
    <>
      <PageHeader
        title={paper.title}
        description={`${paper.kind} · ${paper.durationMinutes} min · Elo ${paper.targetEloMin}–${paper.targetEloMax}`}
      >
        <StartAttemptButton paperId={id} />
      </PageHeader>
      {paper.description ? <p className="mb-6 text-sm text-muted">{paper.description}</p> : null}
      <ol className="space-y-3">
        {items.map((item, index) => (
          <li key={item.questionId} className="rounded-xl border border-line bg-card p-5">
            <p className="text-xs text-muted">
              {index + 1}. {item.question.type} · {item.points} pts
            </p>
            <p className="mt-1">
              <StemText text={promptStem(item.question.stem, item.question.choices.length > 0)} imageId={item.question.stemImageId} />
            </p>
            {teacher && item.question.answerKey ? (
              <p className="mt-2 text-sm text-accent">Key: {item.question.answerKey}</p>
            ) : null}
          </li>
        ))}
      </ol>
    </>
  );
}
