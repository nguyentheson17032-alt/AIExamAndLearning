"use client";

import { uploadQuestionsAction, type QuestionFormState } from "@/lib/question-actions";
import { ProblemAlert } from "@/components/problem-alert";
import { SubmitButton } from "@/components/submit-button";
import { useActionState } from "react";

const SAMPLE = `{
  "questions": [
    {
      "subjectId": "SUBJECT_UUID",
      "type": "MULTIPLE_CHOICE",
      "stem": "2 + 2 = ?",
      "difficulty": "BEGINNER",
      "eloRating": 900,
      "choices": [
        { "label": "A", "content": "3", "correct": false },
        { "label": "B", "content": "4", "correct": true }
      ]
    }
  ]
}`;

export function QuestionUploadForm() {
  const [state, action] = useActionState(uploadQuestionsAction, null as QuestionFormState);
  return (
    <form action={action} className="space-y-4 rounded-xl border border-line bg-card p-6">
      {state?.error ? <ProblemAlert message={state.error} /> : null}
      <label className="block text-sm">
        <span className="font-medium">JSON payload</span>
        <textarea
          name="json"
          required
          rows={18}
          defaultValue={SAMPLE}
          className="mt-1 w-full rounded-md border border-line bg-card px-3 py-2 font-mono text-xs"
        />
      </label>
      <SubmitButton>Upload</SubmitButton>
    </form>
  );
}
