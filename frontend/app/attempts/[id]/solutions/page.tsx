import { PageHeader } from "@/components/page-header";
import { StemText, promptStem, questionSnapshotSrc } from "@/components/stem-text";
import { loadAttemptSolutions } from "@/lib/load-attempt";
import { requireUser } from "@/lib/guards";
import type { Choice } from "@/lib/types";
import Link from "next/link";

function submittedWork(selected: Choice | undefined, textAnswer: string | null | undefined): string {
  if (selected) {
    if (selected.content && !selected.content.includes("[[img:")) {
      return `${selected.label}. ${selected.content}`;
    }
    return selected.label;
  }
  return textAnswer?.trim() || "Không trả lời";
}

export default async function AttemptSolutionsPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const { attempt, paper } = await loadAttemptSolutions(id);
  const answerByQuestion = new Map(attempt.answers.map((answer) => [answer.questionId, answer]));
  const items = paper.questions.toSorted((a, b) => a.sortOrder - b.sortOrder);

  return (
    <>
      <PageHeader
        title={`Lời giải · ${paper.title}`}
        description={`${attempt.score ?? "—"} / ${attempt.maxScore ?? "—"} · Elo ${attempt.eloBefore ?? "—"} → ${attempt.eloAfter ?? "—"}${attempt.eloDelta != null ? ` (+${attempt.eloDelta} theo điểm)` : ""}`}
      >
        <Link href={`/attempts/${id}`} className="rounded-md border border-line px-4 py-2 text-sm">
          Về kết quả
        </Link>
      </PageHeader>
      <ol className="space-y-4">
        {items.map((item, index) => {
          const answer = answerByQuestion.get(item.questionId);
          const selected = item.question.choices.find((choice) => choice.id === answer?.selectedChoiceId);
          const snapshot = questionSnapshotSrc(item.question.stem);
          const previous = index > 0 ? questionSnapshotSrc(items[index - 1].question.stem) : null;
          const showStem = !snapshot || snapshot !== previous;
          const explanation = item.question.explanation ?? "";
          const explSnap = questionSnapshotSrc(explanation);
          const previousExpl =
            index > 0 ? questionSnapshotSrc(items[index - 1].question.explanation ?? "") : null;
          const showExpl = Boolean(explanation) && (!explSnap || explSnap !== previousExpl);
          return (
            <li key={item.questionId} className="rounded-xl border border-line bg-card p-5">
              <p className="text-xs text-muted">
                {item.sectionTitle ?? "Câu hỏi"} · {item.itemLabel ?? item.question.type} · {item.points} điểm
              </p>
              {showStem ? (
                <p className="mt-2">
                  <StemText text={promptStem(item.question.stem, item.question.choices.length > 0)} />
                </p>
              ) : null}
              <p className="mt-3 text-sm">Bài làm: {submittedWork(selected, answer?.textAnswer)}</p>
              <p className="mt-1 text-sm">
                Đáp án: {item.question.answerKey ?? "—"}
                {answer?.score != null ? ` · ${answer.score} điểm` : ""}
                {answer?.correct == null ? "" : answer.correct ? " · Đúng" : " · Sai"}
              </p>
              {showExpl ? (
                <div className="mt-3 rounded-md border border-line px-3 py-2 text-sm">
                  <StemText text={explanation} />
                </div>
              ) : null}
              {answer?.aiFeedback ? <p className="mt-2 text-sm text-muted">{answer.aiFeedback}</p> : null}
            </li>
          );
        })}
      </ol>
    </>
  );
}
