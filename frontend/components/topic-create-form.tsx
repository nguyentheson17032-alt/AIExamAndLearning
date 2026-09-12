"use client";

import { createTopicAction, type CatalogFormState } from "@/lib/catalog-actions";
import { ProblemAlert } from "@/components/problem-alert";
import { SubmitButton } from "@/components/submit-button";
import { TextAreaField, TextField } from "@/components/fields";
import { useActionState } from "react";

export function TopicCreateForm({ subjectId }: { subjectId: string }) {
  const action = createTopicAction.bind(null, subjectId);
  const [state, formAction] = useActionState(action, null as CatalogFormState);
  return (
    <form action={formAction} className="space-y-4 rounded-xl border border-line bg-card p-6">
      <h2 className="font-medium">Add topic</h2>
      {state?.error ? <ProblemAlert message={state.error} /> : null}
      <TextField name="name" label="Name" required />
      <TextAreaField name="description" label="Description" />
      <SubmitButton>Add topic</SubmitButton>
    </form>
  );
}
