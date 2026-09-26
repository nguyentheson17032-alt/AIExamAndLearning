import { PageHeader } from "@/components/page-header";
import { TakeExamForm } from "@/components/take-exam-form";
import { StemText, promptStem, storedImageSrc } from "@/components/stem-text";
import { correctAnswerText } from "@/lib/correct-answer";
import { backendFetch } from "@/lib/backend";
import { loadAttempt, loadAttemptSolutions } from "@/lib/load-attempt";
import { requireUser } from "@/lib/guards";
import type { Paper, PaperItem } from "@/lib/types";
import Link from "next/link";

export default async function AttemptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const attempt = await loadAttempt(id);
  const inProgress = attempt.status === "IN_PROGRESS";
  const solved = attempt.status === "GRADED" ? await loadAttemptSolutions(id) : null;
  const paper: Paper = solved?.paper ?? (await backendFetch<Paper>(`/api/v1/papers/${attempt.paperId}`));
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
            {paper.paperSetId && attempt.eloDelta != null
              ? ` · +${attempt.eloDelta} Elo theo ${attempt.score} điểm`
              : ""}
          </p>
          {attempt.status === "GRADED" ? (
            <Link
              href={`/attempts/${id}/solutions`}
              className="inline-flex rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
            >
              Xem chi tiết lời giải
            </Link>
          ) : null}
          {paper.questions.toSorted((a, b) => a.sortOrder - b.sortOrder).map((item, index, items) => {
            const answer = answerByQuestion.get(item.questionId);
            const previous = index > 0 ? items[index - 1] : null;
            return (
              <section key={item.questionId} className="rounded-xl border border-line bg-card p-5">
                <p className="text-xs text-muted">
                  {item.itemLabel ?? `Câu ${index + 1}`}
                  {item.sectionTitle ? ` · ${item.sectionTitle}` : ""}
                </p>
                <p className="mt-1">
                  <StemText text={promptStem(item.question.stem, item.question.choices.length > 0)} imageId={item.question.stemImageId} />
                </p>
                <p className="mt-2 text-sm">
                  {answer?.correct == null ? "Chưa chấm" : answer.correct ? "Đúng" : "Sai"}
                  {answer?.score != null ? ` · ${answer.score} điểm` : ""}
                </p>
                {solved ? <SolutionBlock item={item} previous={previous} /> : null}
                {answer?.aiFeedback ? <p className="mt-1 text-sm text-muted">{answer.aiFeedback}</p> : null}
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}

function SolutionBlock({ item, previous }: { item: PaperItem; previous: PaperItem | null }) {
  const explanation = item.question.explanation ?? "";
  const explSnap = storedImageSrc(item.question.explanationImageId, explanation);
  const previousExpl = previous
    ? storedImageSrc(previous.question.explanationImageId, previous.question.explanation ?? "")
    : null;
  const showExpl = Boolean(explanation || explSnap) && (!explSnap || explSnap !== previousExpl);
  if (!showExpl && !item.question.answerKey) {
    return null;
  }
  return (
    <div className="mt-3">
      <p className="text-sm">Đáp án: {correctAnswerText(item.question)}</p>
      {showExpl ? (
        <div className="mt-2 rounded-md border border-line px-3 py-2 text-sm">
          <StemText text={explanation} imageId={item.question.explanationImageId} />
        </div>
      ) : null}
    </div>
  );
}
