import { AiQuestionActions } from "@/components/ai-question-actions";
import { PageHeader } from "@/components/page-header";
import { StemText, promptStem } from "@/components/stem-text";
import { archiveQuestionAction } from "@/lib/question-actions";
import { backendFetch } from "@/lib/backend";
import { requireTeacher } from "@/lib/guards";
import type { Question } from "@/lib/types";

export default async function QuestionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireTeacher();
  const { id } = await params;
  const question = await backendFetch<Question>(`/api/v1/questions/${id}`);
  return (
    <>
      <PageHeader title="Question" description={`${question.type} · ${question.difficulty} · Elo ${question.eloRating}`} />
      <article className="space-y-4 rounded-xl border border-line bg-card p-6">
        <p>
          <StemText text={promptStem(question.stem, question.choices.length > 0)} />
        </p>
        {question.choices.length > 0 ? (
          <ul className="space-y-1 text-sm">
            {question.choices.map((choice) => (
              <li key={choice.id}>
                <span className="font-medium">{choice.label}.</span> <StemText text={choice.content} />
                {choice.correct ? <span className="ml-2 text-accent">correct</span> : null}
              </li>
            ))}
          </ul>
        ) : null}
        {question.answerKey ? (
          <p className="text-sm">
            <span className="font-medium">Answer key:</span> {question.answerKey}
          </p>
        ) : null}
        {question.explanation ? <p className="text-sm text-muted">{question.explanation}</p> : null}
        <p className="text-xs text-muted">
          Bloom {question.bloomLevel ?? "—"} · {question.source} · {question.status}
        </p>
      </article>
      <div className="mt-6 flex flex-wrap items-start gap-6">
        <AiQuestionActions questionId={id} />
        <form action={archiveQuestionAction.bind(null, id)}>
          <button type="submit" className="rounded-md border border-danger/40 px-3 py-2 text-sm text-danger">
            Archive
          </button>
        </form>
      </div>
    </>
  );
}
