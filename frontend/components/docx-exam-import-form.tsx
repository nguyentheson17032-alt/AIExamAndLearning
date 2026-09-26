"use client";

import { ProblemAlert } from "@/components/problem-alert";
import { SubmitButton } from "@/components/submit-button";
import { TextField } from "@/components/fields";
import { importExamAction, type ExamUploadState } from "@/lib/exam-upload-actions";
import { useActionState } from "react";

export function DocxExamImportForm({ subjectId }: { subjectId: string }) {
  const [state, action] = useActionState(
    (previous: ExamUploadState, formData: FormData) => importExamAction(subjectId, previous, formData),
    null as ExamUploadState,
  );
  return (
    <form action={action} className="space-y-4 rounded-xl border border-line bg-card p-6">
      {state?.error ? <ProblemAlert message={state.error} /> : null}
      <TextField name="title" label="Tên bộ đề" />
      <label className="block text-sm">
        <span className="font-medium">File Word (.docx)</span>
        <input
          name="file"
          type="file"
          accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          required
          className="mt-1 block w-full text-sm"
        />
      </label>
      <SubmitButton>Tải đề</SubmitButton>
    </form>
  );
}
