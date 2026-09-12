"use client";

import { generatePaperAction, type PaperFormState } from "@/lib/paper-actions";
import { ProblemAlert } from "@/components/problem-alert";
import { SelectField, TextField } from "@/components/fields";
import { SubmitButton } from "@/components/submit-button";
import type { Subject } from "@/lib/types";
import { useActionState } from "react";

export function PaperGenerateForm({ subjects }: { subjects: Subject[] }) {
  const [state, action] = useActionState(generatePaperAction, null as PaperFormState);
  return (
    <form action={action} className="max-w-lg space-y-4 rounded-xl border border-line bg-card p-6">
      {state?.error ? <ProblemAlert message={state.error} /> : null}
      <TextField name="title" label="Title" />
      <SelectField
        name="subjectId"
        label="Subject"
        options={subjects.map((subject) => ({ value: subject.id, label: `${subject.code} · ${subject.name}` }))}
      />
      <SelectField
        name="kind"
        label="Kind"
        defaultValue="PRACTICE"
        options={[
          { value: "EXAM", label: "Exam" },
          { value: "ASSIGNMENT", label: "Assignment" },
          { value: "PRACTICE", label: "Practice" },
        ]}
      />
      <TextField name="questionCount" label="Question count" type="number" defaultValue={5} min={1} max={50} required />
      <TextField name="durationMinutes" label="Duration (minutes)" type="number" defaultValue={30} min={1} max={300} required />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField name="targetEloMin" label="Elo min" type="number" defaultValue={800} min={100} />
        <TextField name="targetEloMax" label="Elo max" type="number" defaultValue={1400} min={100} />
      </div>
      <SubmitButton>Generate from Elo range</SubmitButton>
    </form>
  );
}
