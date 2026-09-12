"use client";

import { adjustEloAction, type AiFormState } from "@/lib/ai-actions";
import { ProblemAlert } from "@/components/problem-alert";
import { useState, useTransition } from "react";

export function AiEloButton({ attemptId }: { attemptId: string }) {
  const [state, setState] = useState<AiFormState>(null);
  const [pending, startTransition] = useTransition();
  return (
    <div className="space-y-2">
      {state?.error ? <ProblemAlert message={state.error} /> : null}
      {state?.message ? <p className="text-sm text-accent">{state.message}</p> : null}
      <button
        type="button"
        disabled={pending}
        className="rounded-md border border-line px-3 py-2 text-sm hover:border-accent disabled:opacity-60"
        onClick={() =>
          startTransition(async () => {
            setState(await adjustEloAction(attemptId));
          })
        }
      >
        AI Elo adjustment
      </button>
    </div>
  );
}
