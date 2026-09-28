"use client";

import { addStudentAction, type ClassroomFormState } from "@/lib/classroom-actions";
import { ProblemAlert } from "@/components/problem-alert";
import { TextField } from "@/components/fields";
import { SubmitButton } from "@/components/submit-button";
import { useActionState } from "react";

export function AddStudentForm({
  classroomId,
  children,
}: {
  classroomId: string;
  children?: React.ReactNode;
}) {
  const [state, action] = useActionState(addStudentAction.bind(null, classroomId), null as ClassroomFormState);
  return (
    <div className="space-y-4 rounded-xl border border-line bg-card p-6">
      <form action={action} className="space-y-4">
        {state?.error ? <ProblemAlert message={state.error} /> : null}
        {state?.message ? <p className="text-sm text-muted">{state.message}</p> : null}
        <TextField name="displayName" label="Display name của học sinh" required />
        <SubmitButton pendingLabel="Đang thêm…">Thêm học sinh</SubmitButton>
      </form>
      {children}
    </div>
  );
}
