"use client";

import { createSubjectAction, type CatalogFormState } from "@/lib/catalog-actions";
import { ProblemAlert } from "@/components/problem-alert";
import { SubmitButton } from "@/components/submit-button";
import { TextAreaField, TextField } from "@/components/fields";
import { useActionState } from "react";

export function SubjectCreateForm() {
  const [state, action] = useActionState(createSubjectAction, null as CatalogFormState);
  return (
    <form action={action} className="max-w-lg space-y-4 rounded-xl border border-line bg-card p-6">
      {state?.error ? <ProblemAlert message={state.error} /> : null}
      <TextField name="code" label="Code" required />
      <TextField name="name" label="Name" required />
      <TextAreaField name="description" label="Description" />
      <SubmitButton>Create subject</SubmitButton>
    </form>
  );
}
