import { PageHeader } from "@/components/page-header";
import { backendFetch } from "@/lib/backend";
import { requireUser } from "@/lib/guards";
import type { Attempt, Paper } from "@/lib/types";
import Link from "next/link";

type AttemptSolution = {
  attempt: Attempt;
  paper: Paper;
};

export default async function AttemptSolutionsPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const { attempt, paper } = await backendFetch<AttemptSolution>(`/api/v1/attempts/${id}/solutions`);
  const answerByQuestion = new Map(attempt.answers.map((answer) => [answer.questionId, answer]));
  const items = paper.questions.toSorted((a, b) => a.sortOrder - b.sortOrder);

  return (
    <>
      <PageHeader
        title={`Lời giải · ${paper.title}`}
        description={`${attempt.score ?? "—"} / ${attempt.maxScore ?? "—"} · Elo ${attempt.eloBefore ?? "—"} → ${attempt.eloAfter ?? "—"}`}
      >
        <Link href={`/attempts/${id}`} className="rounded-md border border-line px-4 py-2 text-sm">
          Về kết quả
        </Link>
      </PageHeader>
      <ol className="space-y-4">
        {items.map((item) => {
          const answer = answerByQuestion.get(item.questionId);
          const selected = item.question.choices.find((choice) => choice.id === answer?.selectedChoiceId);
          return (
            <li key={item.questionId} className="rounded-xl border border-line bg-card p-5">
              <p className="text-xs text-muted">
                {item.sectionTitle ?? "Câu hỏi"} · {item.itemLabel ?? item.question.type} · {item.points} điểm
              </p>
              <p className="mt-2 whitespace-pre-wrap">{item.question.stem}</p>
              <p className="mt-3 text-sm">
                Bài làm:{" "}
                {selected
                  ? `${selected.label}. ${selected.content}`
                  : answer?.textAnswer || "Không trả lời"}
              </p>
              <p className="mt-1 text-sm">
                Đáp án: {item.question.answerKey ?? "—"}
                {answer?.score != null ? ` · ${answer.score} điểm` : ""}
                {answer?.correct == null ? "" : answer.correct ? " · Đúng" : " · Sai"}
              </p>
              {item.question.explanation ? (
                <div className="mt-3 rounded-md border border-line px-3 py-2 text-sm whitespace-pre-wrap">
                  {item.question.explanation}
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
