"use client";

import { createClassroomAction, type ClassroomFormState } from "@/lib/classroom-actions";
import { ProblemAlert } from "@/components/problem-alert";
import { TextField } from "@/components/fields";
import { SubmitButton } from "@/components/submit-button";
import { useActionState } from "react";

export function ClassroomCreateForm() {
  const [state, action] = useActionState(createClassroomAction, null as ClassroomFormState);
  return (
    <form action={action} className="space-y-4 rounded-xl border border-line bg-card p-6">
      {state?.error ? <ProblemAlert message={state.error} /> : null}
      <TextField name="name" label="Tên lớp" required />
      <SubmitButton pendingLabel="Đang tạo…">Tạo lớp</SubmitButton>
    </form>
  );
}
