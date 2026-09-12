"use client";

import { classifyQuestionAction, generateSimilarAction, type AiFormState } from "@/lib/ai-actions";
import { ProblemAlert } from "@/components/problem-alert";
import { useState, useTransition } from "react";

export function AiQuestionActions({ questionId }: { questionId: string }) {
  const [state, setState] = useState<AiFormState>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-3">
      {state?.error ? <ProblemAlert message={state.error} /> : null}
      {state?.message ? <p className="text-sm text-accent">{state.message}</p> : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          className="rounded-md border border-line px-3 py-2 text-sm hover:border-accent disabled:opacity-60"
          onClick={() =>
            startTransition(async () => {
              setState(await classifyQuestionAction(questionId));
            })
          }
        >
          AI classify
        </button>
        <button
          type="button"
          disabled={pending}
          className="rounded-md border border-line px-3 py-2 text-sm hover:border-accent disabled:opacity-60"
          onClick={() =>
            startTransition(async () => {
              setState(await generateSimilarAction(questionId));
            })
          }
        >
          Generate similar
        </button>
      </div>
    </div>
  );
}
