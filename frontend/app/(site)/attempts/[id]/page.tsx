import { AiEloButton } from "@/components/ai-elo-button";
import { PageHeader } from "@/components/page-header";
import { TakeExamForm } from "@/components/take-exam-form";
import { backendFetch } from "@/lib/backend";
import { requireUser } from "@/lib/guards";
import type { Attempt, Paper } from "@/lib/types";

export default async function AttemptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const attempt = await backendFetch<Attempt>(`/api/v1/attempts/${id}`);
  const paper = await backendFetch<Paper>(`/api/v1/papers/${attempt.paperId}`);
  const inProgress = attempt.status === "IN_PROGRESS";
  const answerByQuestion = new Map(attempt.answers.map((answer) => [answer.questionId, answer]));

  return (
    <>
      <PageHeader
        title={paper.title}
        description={
          inProgress
            ? `${paper.durationMinutes} minutes · submit when ready`
            : `${attempt.status} · ${attempt.score ?? "—"} / ${attempt.maxScore ?? "—"}`
        }
      />
      {inProgress ? (
        <TakeExamForm attemptId={id} paper={paper} />
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Elo {attempt.eloBefore ?? "—"} → {attempt.eloAfter ?? "—"}
            {attempt.eloDelta != null ? ` (${attempt.eloDelta > 0 ? "+" : ""}${attempt.eloDelta})` : ""}
            {attempt.rankAfter ? ` · ${attempt.rankAfter}` : ""}
          </p>
          {paper.questions.toSorted((a, b) => a.sortOrder - b.sortOrder).map((item, index) => {
            const answer = answerByQuestion.get(item.questionId);
            return (
              <section key={item.questionId} className="rounded-xl border border-line bg-card p-5">
                <p className="text-xs text-muted">Question {index + 1}</p>
                <p className="mt-1 whitespace-pre-wrap">{item.question.stem}</p>
                <p className="mt-2 text-sm">
                  {answer?.correct == null ? "Ungraded" : answer.correct ? "Correct" : "Incorrect"}
                  {answer?.score != null ? ` · ${answer.score} pts` : ""}
                </p>
                {answer?.aiFeedback ? <p className="mt-1 text-sm text-muted">{answer.aiFeedback}</p> : null}
              </section>
            );
          })}
          {attempt.status === "GRADED" ? <AiEloButton attemptId={id} /> : null}
        </div>
      )}
    </>
  );
}
