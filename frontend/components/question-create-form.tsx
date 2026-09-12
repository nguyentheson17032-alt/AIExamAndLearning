"use client";

import { createQuestionAction, type QuestionFormState } from "@/lib/question-actions";
import { ProblemAlert } from "@/components/problem-alert";
import { SelectField, TextAreaField, TextField } from "@/components/fields";
import { SubmitButton } from "@/components/submit-button";
import type { Subject } from "@/lib/types";
import { useActionState } from "react";

export function QuestionCreateForm({ subjects }: { subjects: Subject[] }) {
  const [state, action] = useActionState(createQuestionAction, null as QuestionFormState);
  return (
    <form action={action} className="max-w-2xl space-y-4 rounded-xl border border-line bg-card p-6">
      {state?.error ? <ProblemAlert message={state.error} /> : null}
      <SelectField
        name="subjectId"
        label="Subject"
        options={subjects.map((subject) => ({ value: subject.id, label: `${subject.code} · ${subject.name}` }))}
      />
      <SelectField
        name="type"
        label="Type"
        options={[
          { value: "MULTIPLE_CHOICE", label: "Multiple choice" },
          { value: "TRUE_FALSE", label: "True / false" },
          { value: "SHORT_ANSWER", label: "Short answer" },
          { value: "ESSAY", label: "Essay" },
        ]}
      />
      <TextAreaField name="stem" label="Stem" required />
      <div className="grid gap-3 sm:grid-cols-2">
        {["A", "B", "C", "D"].map((label, index) => (
          <label key={label} className="block text-sm">
            <span className="font-medium">Choice {label}</span>
            <input type="hidden" name="choiceLabel" value={label} />
            <input name="choiceContent" className="mt-1 w-full rounded-md border border-line bg-card px-3 py-2" />
            <span className="mt-1 flex items-center gap-2 text-xs text-muted">
              <input type="radio" name="correctChoice" value={String(index)} defaultChecked={index === 0} />
              Correct
            </span>
          </label>
        ))}
      </div>
      <TextAreaField name="answerKey" label="Answer key (short/essay)" />
      <TextAreaField name="explanation" label="Explanation" />
      <SelectField
        name="difficulty"
        label="Difficulty"
        defaultValue="INTERMEDIATE"
        options={[
          { value: "BEGINNER", label: "Beginner" },
          { value: "INTERMEDIATE", label: "Intermediate" },
          { value: "ADVANCED", label: "Advanced" },
          { value: "EXPERT", label: "Expert" },
        ]}
      />
      <TextField name="eloRating" label="Elo" type="number" defaultValue={1000} min={100} max={3000} required />
      <SelectField
        name="status"
        label="Status"
        defaultValue="PUBLISHED"
        options={[
          { value: "DRAFT", label: "Draft" },
          { value: "PUBLISHED", label: "Published" },
        ]}
      />
      <SubmitButton>Create question</SubmitButton>
    </form>
  );
}
