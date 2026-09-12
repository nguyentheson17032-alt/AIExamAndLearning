"use client";

import { startPracticeAction, type PaperFormState } from "@/lib/paper-actions";
import { ProblemAlert } from "@/components/problem-alert";
import { SelectField, TextField } from "@/components/fields";
import { SubmitButton } from "@/components/submit-button";
import type { Subject } from "@/lib/types";
import { useActionState } from "react";

export function PracticeForm({ subjects }: { subjects: Subject[] }) {
  const [state, action] = useActionState(startPracticeAction, null as PaperFormState);
  return (
    <form action={action} className="max-w-lg space-y-4 rounded-xl border border-line bg-card p-6">
      {state?.error ? <ProblemAlert message={state.error} /> : null}
      <SelectField
        name="subjectId"
        label="Subject"
        options={subjects.map((subject) => ({ value: subject.id, label: `${subject.code} · ${subject.name}` }))}
      />
      <TextField name="questionCount" label="Question count" type="number" defaultValue={5} min={1} max={30} required />
      <TextField name="durationMinutes" label="Duration (minutes)" type="number" defaultValue={20} min={10} max={180} required />
      <SubmitButton>Start Elo practice</SubmitButton>
    </form>
  );
}
