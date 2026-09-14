"use client";

import { submitAttemptAction, type AttemptFormState } from "@/lib/attempt-actions";
import { examNavItems, examSteps, examSubmitFormData, isAnswered, isWrittenQuestion } from "@/lib/exam-steps";
import { ProblemAlert } from "@/components/problem-alert";
import { StemText, promptStem, storedImageSrc } from "@/components/stem-text";
import { SubmitButton } from "@/components/submit-button";
import type { Paper, PaperItem } from "@/lib/types";
import { useRouter } from "next/navigation";
import { FormEvent, startTransition, useActionState, useEffect, useState } from "react";

function answersKey(attemptId: string) {
  return `attempt-answers:${attemptId}`;
}

export function TakeExamForm({ attemptId, paper }: { attemptId: string; paper: Paper }) {
  const router = useRouter();
  const action = submitAttemptAction.bind(null, attemptId);
  const [state, formAction, pending] = useActionState(action, null as AttemptFormState);
  const steps = examSteps(paper.questions);
  const nav = examNavItems(steps);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [restored, setRestored] = useState(false);
  const step = steps[current];
  const last = current === steps.length - 1;
  const doneCount = nav.filter((item) => isAnswered(answers[item.questionId])).length;
  const complete = nav.length > 0 && doneCount === nav.length;
  const remaining = nav.length - doneCount;

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(answersKey(attemptId));
      if (raw) {
        const saved = JSON.parse(raw) as Record<string, string>;
        if (saved && typeof saved === "object") {
          setAnswers(saved);
        }
      }
    } catch {
      /* ignore broken drafts */
    }
    setRestored(true);
  }, [attemptId]);

  useEffect(() => {
    if (!restored) {
      return;
    }
    sessionStorage.setItem(answersKey(attemptId), JSON.stringify(answers));
  }, [answers, attemptId, restored]);

  useEffect(() => {
    if (!state || !("ok" in state)) {
      return;
    }
    sessionStorage.removeItem(answersKey(attemptId));
    router.push(`/attempts/${attemptId}`);
    router.refresh();
  }, [attemptId, router, state]);

  function markAnswer(questionId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!complete) {
      const firstOpen = nav.find((item) => !isAnswered(answers[item.questionId]));
      if (firstOpen) {
        setCurrent(firstOpen.stepIndex);
      }
      return;
    }
    startTransition(() => {
      formAction(examSubmitFormData(paper.questions, answers));
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {state?.error ? <ProblemAlert message={state.error} /> : null}
      <section className="rounded-xl border border-line bg-card p-4">
        <p className="text-sm font-medium">Tiến độ làm bài</p>
        <p className="mt-1 text-xs text-muted">
          Đã làm {doneCount}/{nav.length}
          {remaining > 0 ? ` · còn ${remaining} câu chưa làm` : " · đủ câu, có thể nộp bài"}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {nav.map((item) => {
            const done = isAnswered(answers[item.questionId]);
            const active = item.stepIndex === current;
            return (
              <button
                key={item.questionId}
                type="button"
                onClick={() => setCurrent(item.stepIndex)}
                className={`min-w-12 rounded-md border px-2 py-1 text-xs ${
                  done
                    ? "border-accent bg-accent text-white"
                    : "border-danger text-danger"
                } ${active ? "ring-2 ring-accent/40" : ""}`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
        {complete ? null : (
          <p className="mt-3 text-xs text-danger">Trả lời hết tất cả các câu mới được nộp bài.</p>
        )}
      </section>
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
            <QuestionPrompt
              key={item.questionId}
              item={item}
              showStem={itemIndex === 0}
              value={answers[item.questionId] ?? ""}
              onAnswer={markAnswer}
            />
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
        {last ? null : (
          <button
            type="button"
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
            onClick={() => setCurrent((value) => Math.min(steps.length - 1, value + 1))}
          >
            Next
          </button>
        )}
        <SubmitButton disabled={!complete || pending}>{pending ? "Saving…" : "Nộp bài"}</SubmitButton>
      </div>
      {step ? (
        <p className="text-xs text-muted">
          Điểm câu này: {step.items.reduce((sum, item) => sum + item.points, 0)} / thang 10 của cả đề.
        </p>
      ) : null}
    </form>
  );
}

function QuestionPrompt({
  item,
  showStem,
  value,
  onAnswer,
}: {
  item: PaperItem;
  showStem: boolean;
  value: string;
  onAnswer: (questionId: string, value: string) => void;
}) {
  const question = item.question;
  const written = isWrittenQuestion(question.type);
  const snapshot = storedImageSrc(question.stemImageId, question.stem);
  const letterOnly = Boolean(snapshot && question.type === "MULTIPLE_CHOICE");
  return (
    <div className="mt-4">
      <p className="text-xs text-muted">{item.itemLabel ?? question.type}</p>
      {showStem ? (
        <p className="mt-2">
          <StemText text={promptStem(question.stem, question.choices.length > 0)} imageId={question.stemImageId} />
        </p>
      ) : null}
      {written ? (
        <textarea
          rows={question.type === "ESSAY" ? 6 : 3}
          className="mt-4 w-full rounded-md border border-line px-3 py-2"
          placeholder="Nhập đáp án"
          value={value}
          onChange={(event) => onAnswer(question.id, event.target.value)}
        />
      ) : (
        <div className="mt-4 space-y-2">
          {question.choices.map((choice) => (
            <label key={choice.id} className="flex items-start gap-2 text-sm">
              <input
                type="radio"
                name={`choice-${question.id}`}
                value={choice.id}
                className="mt-1"
                checked={value === choice.id}
                onChange={() => onAnswer(question.id, choice.id)}
              />
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
