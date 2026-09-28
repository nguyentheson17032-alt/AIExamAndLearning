"use client";

import { removePaperAction } from "@/lib/classroom-actions";
import { useTransition } from "react";

export function RemovePaperButton({
  classroomId,
  paperId,
}: {
  classroomId: string;
  paperId: string;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      className="shrink-0 text-sm text-muted hover:text-danger disabled:opacity-60"
      onClick={() => startTransition(() => removePaperAction(classroomId, paperId))}
    >
      {pending ? "Đang gỡ…" : "Gỡ khỏi lớp"}
    </button>
  );
}
