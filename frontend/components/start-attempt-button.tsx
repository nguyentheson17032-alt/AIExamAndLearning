"use client";

import { ProblemAlert } from "@/components/problem-alert";
import { SubmitButton } from "@/components/submit-button";
import { startAttemptAction, type PaperFormState } from "@/lib/paper-actions";
import { useActionState } from "react";

export function StartAttemptButton({ paperId }: { paperId: string }) {
  const [state, action] = useActionState(
    (_prev: PaperFormState, _formData: FormData) => startAttemptAction(paperId),
    null as PaperFormState,
  );
  return (
    <form action={action} className="flex flex-col items-end gap-2">
      {state?.error ? <ProblemAlert message={state.error} /> : null}
      <SubmitButton>Làm đề</SubmitButton>
    </form>
  );
}
