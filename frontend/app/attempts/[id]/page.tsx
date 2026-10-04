import { PageHeader } from "@/components/page-header";
import { TakeExamForm } from "@/components/take-exam-form";
import { StemText, promptStem } from "@/components/stem-text";
import { submittedWork } from "@/lib/correct-answer";
import { backendFetch } from "@/lib/backend";
import { loadAttempt } from "@/lib/load-attempt";
import { requireUser } from "@/lib/guards";
import type { Paper } from "@/lib/types";
import Link from "next/link";

export default async function AttemptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const attempt = await loadAttempt(id);
  const inProgress = attempt.status === "IN_PROGRESS";
  const paper = await backendFetch<Paper>(`/api/v1/papers/${attempt.paperId}`);
  const answerByQuestion = new Map(attempt.answers.map((answer) => [answer.questionId, answer]));

  return (
    <>
      <PageHeader
        title={paper.title}
        description={
          inProgress
            ? `${paper.durationMinutes} phút · từng phần, từng câu · Next để sang câu tiếp theo`
            : `${attempt.status} · ${attempt.score ?? "—"} / ${attempt.maxScore ?? "—"}`
        }
      />
      {inProgress ? (
        <TakeExamForm attemptId={id} paper={paper} startedAt={attempt.startedAt} />
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Elo {attempt.eloBefore ?? "—"} → {attempt.eloAfter ?? "—"}
            {attempt.eloDelta != null ? ` (${attempt.eloDelta > 0 ? "+" : ""}${attempt.eloDelta})` : ""}
            {attempt.rankAfter ? ` · ${attempt.rankAfter}` : ""}
          </p>
          {attempt.status === "GRADED" ? (
            <Link
              href={`/attempts/${id}/solutions`}
              className="inline-flex rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
            >
              Xem chi tiết lời giải
            </Link>
          ) : null}
          {paper.questions.toSorted((a, b) => a.sortOrder - b.sortOrder).map((item, index) => {
            const answer = answerByQuestion.get(item.questionId);
            const choices = item.question.choices ?? [];
            const selected = choices.find((choice) => choice.id === answer?.selectedChoiceId);
            return (
              <section key={item.questionId} className="rounded-xl border border-line bg-card p-5">
                <p className="text-xs text-muted">
                  {item.itemLabel ?? `Câu ${index + 1}`}
                  {item.sectionTitle ? ` · ${item.sectionTitle}` : ""}
                </p>
                <p className="mt-1">
                  <StemText text={promptStem(item.question.stem, choices.length > 0)} imageId={item.question.stemImageId} />
                </p>
                <p className="mt-2 text-sm">Bài làm: {submittedWork(selected, answer?.textAnswer)}</p>
                <p className="mt-1 text-sm">
                  {answer?.correct == null ? "Chưa chấm" : answer.correct ? "Đúng" : "Sai"}
                  {answer?.score != null ? ` · ${answer.score} điểm` : ""}
                </p>
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}
