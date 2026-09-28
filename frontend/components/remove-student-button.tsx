"use client";

import { removeStudentAction } from "@/lib/classroom-actions";
import { useTransition } from "react";

export function RemoveStudentButton({
  classroomId,
  studentId,
}: {
  classroomId: string;
  studentId: string;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      className="text-sm text-muted hover:text-danger disabled:opacity-60"
      onClick={() => startTransition(() => removeStudentAction(classroomId, studentId))}
    >
      {pending ? "Đang xóa…" : "Xóa"}
    </button>
  );
}
