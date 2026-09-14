"use client";

import { submitAttemptAction, type AttemptFormState } from "@/lib/attempt-actions";
import { examSteps } from "@/lib/exam-steps";
import { ProblemAlert } from "@/components/problem-alert";
import { StemText, promptStem, questionSnapshotSrc } from "@/components/stem-text";
import { SubmitButton } from "@/components/submit-button";
import type { Paper, PaperItem } from "@/lib/types";
import { useActionState, useState } from "react";

export function TakeExamForm({ attemptId, paper }: { attemptId: string; paper: Paper }) {
  const action = submitAttemptAction.bind(null, attemptId);
  const [state, formAction] = useActionState(action, null as AttemptFormState);
  const steps = examSteps(paper.questions);
  const [current, setCurrent] = useState(0);
  const step = steps[current];
  const last = current === steps.length - 1;

  return (
    <form action={formAction} className="space-y-6">
      {state?.error ? <ProblemAlert message={state.error} /> : null}
      {steps.map((entry, index) => (
        <section
          key={entry.groupKey}
          hidden={index !== current}
          className="rounded-xl border border-line bg-card p-5"
        >
          <p className="text-xs text-muted">
            {entry.sectionTitle} · Câu {index + 1}/{steps.length}
          </p>
          {entry.items.map((item, itemIndex) => (
            <QuestionPrompt key={item.questionId} item={item} showStem={itemIndex === 0} />
          ))}

        </section>
      ))}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="rounded-md border border-line px-4 py-2 text-sm disabled:opacity-50"
          disabled={current === 0}
          onClick={() => setCurrent((value) => Math.max(0, value - 1))}
        >
          Trước
        </button>
        {last ? (
          <SubmitButton>Nộp bài</SubmitButton>
        ) : (
          <button
            type="button"
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
            onClick={() => setCurrent((value) => Math.min(steps.length - 1, value + 1))}
          >
            Next
          </button>
        )}
      </div>
      {step ? (
        <p className="text-xs text-muted">
          Điểm câu này: {step.items.reduce((sum, item) => sum + item.points, 0)} / thang 10 của cả đề.
        </p>
      ) : null}
    </form>
  );
}

function QuestionPrompt({ item, showStem }: { item: PaperItem; showStem: boolean }) {
  const question = item.question;
  const written = question.type === "SHORT_ANSWER" || question.type === "ESSAY";
  const snapshot = questionSnapshotSrc(question.stem);
  const letterOnly = Boolean(snapshot && question.type === "MULTIPLE_CHOICE");
  return (
    <div className="mt-4">
      <input type="hidden" name="questionId" value={question.id} />
      <p className="text-xs text-muted">{item.itemLabel ?? question.type}</p>
      {showStem ? (
        <p className="mt-2">
          <StemText text={promptStem(question.stem, question.choices.length > 0)} />
        </p>
      ) : null}
      {written ? (
        <textarea
          name={`text-${question.id}`}
          rows={question.type === "ESSAY" ? 6 : 3}
          className="mt-4 w-full rounded-md border border-line px-3 py-2"
          placeholder="Nhập đáp án"
        />
      ) : (
        <div className="mt-4 space-y-2">
          {question.choices.map((choice) => (
            <label key={choice.id} className="flex items-start gap-2 text-sm">
              <input type="radio" name={`choice-${question.id}`} value={choice.id} className="mt-1" />
              <span>
                <span className="font-medium">{choice.label}.</span>
                {letterOnly ? null : (
                  <>
                    {" "}
                    <StemText text={choice.content} />
                  </>
                )}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
