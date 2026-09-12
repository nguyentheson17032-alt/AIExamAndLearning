"use client";

import { createPaperAction, type PaperFormState } from "@/lib/paper-actions";
import { ProblemAlert } from "@/components/problem-alert";
import { SelectField, TextAreaField, TextField } from "@/components/fields";
import { SubmitButton } from "@/components/submit-button";
import type { Question, Subject } from "@/lib/types";
import { useActionState } from "react";

export function PaperCreateForm({ subjects, questions }: { subjects: Subject[]; questions: Question[] }) {
  const [state, action] = useActionState(createPaperAction, null as PaperFormState);
  return (
    <form action={action} className="space-y-4 rounded-xl border border-line bg-card p-6">
      {state?.error ? <ProblemAlert message={state.error} /> : null}
      <TextField name="title" label="Title" required />
      <SelectField
        name="subjectId"
        label="Subject"
        options={subjects.map((subject) => ({ value: subject.id, label: `${subject.code} · ${subject.name}` }))}
      />
      <SelectField
        name="kind"
        label="Kind"
        options={[
          { value: "EXAM", label: "Exam" },
          { value: "ASSIGNMENT", label: "Assignment" },
          { value: "PRACTICE", label: "Practice" },
        ]}
      />
      <TextAreaField name="description" label="Description" />
      <TextField name="durationMinutes" label="Duration (minutes)" type="number" defaultValue={45} min={1} max={300} required />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField name="targetEloMin" label="Elo min" type="number" defaultValue={800} min={100} required />
        <TextField name="targetEloMax" label="Elo max" type="number" defaultValue={1400} min={100} required />
      </div>
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Questions</legend>
        {questions.length === 0 ? (
          <p className="text-sm text-muted">No published questions yet.</p>
        ) : (
          questions.map((question) => (
            <label key={question.id} className="flex items-start gap-2 text-sm">
              <input type="checkbox" name="questionId" value={question.id} className="mt-1" />
              <span>
                {question.stem.slice(0, 140)}
                <span className="block text-xs text-muted">
                  {question.difficulty} · Elo {question.eloRating}
                </span>
              </span>
            </label>
          ))
        )}
      </fieldset>
      <SubmitButton>Create paper</SubmitButton>
    </form>
  );
}
