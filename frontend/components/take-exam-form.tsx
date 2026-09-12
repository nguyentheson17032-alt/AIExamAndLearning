"use client";

import { submitAttemptAction, type AttemptFormState } from "@/lib/attempt-actions";
import { ProblemAlert } from "@/components/problem-alert";
import { SubmitButton } from "@/components/submit-button";
import type { Paper } from "@/lib/types";
import { useActionState } from "react";

export function TakeExamForm({ attemptId, paper }: { attemptId: string; paper: Paper }) {
  const action = submitAttemptAction.bind(null, attemptId);
  const [state, formAction] = useActionState(action, null as AttemptFormState);
  const items = paper.questions.toSorted((a, b) => a.sortOrder - b.sortOrder);

  return (
    <form action={formAction} className="space-y-6">
      {state?.error ? <ProblemAlert message={state.error} /> : null}
      {items.map((item, index) => {
        const question = item.question;
        const written = question.type === "SHORT_ANSWER" || question.type === "ESSAY";
        return (
          <section key={question.id} className="rounded-xl border border-line bg-card p-5">
            <input type="hidden" name="questionId" value={question.id} />
            <p className="text-xs text-muted">
              Question {index + 1} · {question.difficulty} · {item.points} pts
            </p>
            <p className="mt-2 whitespace-pre-wrap">{question.stem}</p>
            {written ? (
              <textarea
                name={`text-${question.id}`}
                rows={question.type === "ESSAY" ? 6 : 3}
                className="mt-4 w-full rounded-md border border-line px-3 py-2"
              />
            ) : (
              <div className="mt-4 space-y-2">
                {question.choices.map((choice) => (
                  <label key={choice.id} className="flex items-start gap-2 text-sm">
                    <input type="radio" name={`choice-${question.id}`} value={choice.id} className="mt-1" />
                    <span>
                      <span className="font-medium">{choice.label}.</span> {choice.content}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </section>
        );
      })}
      <SubmitButton>Submit answers</SubmitButton>
    </form>
  );
}
