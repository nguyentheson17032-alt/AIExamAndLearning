"use client";

import { ProblemAlert } from "@/components/problem-alert";
import { SubmitButton } from "@/components/submit-button";
import { renameClassroomAction, type ClassroomFormState } from "@/lib/classroom-actions";
import { useActionState, useState } from "react";

export function RenameClassroomForm({ classroomId, name }: { classroomId: string; name: string }) {
  const [editing, setEditing] = useState(false);
  const [shownName, setShownName] = useState(name);
  const [state, action] = useActionState(renameClassroomAction.bind(null, classroomId), null as ClassroomFormState);
  if (name !== shownName) {
    setShownName(name);
    setEditing(false);
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">{name}</h1>
        <button
          type="button"
          aria-label="Đổi tên lớp"
          onClick={() => setEditing(true)}
          className="rounded-md p-1 text-muted hover:bg-line hover:text-foreground"
        >
          <PencilIcon />
        </button>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input
        name="name"
        required
        autoFocus
        defaultValue={name}
        maxLength={120}
        aria-label="Tên lớp"
        className="w-64 rounded-md border border-line bg-card px-3 py-1.5 text-lg font-semibold"
      />
      <SubmitButton pendingLabel="Đang lưu…">Lưu</SubmitButton>
      <button
        type="button"
        onClick={() => setEditing(false)}
        className="rounded-md border border-line px-3 py-2 text-sm hover:border-accent"
      >
        Hủy
      </button>
      {state?.error ? <ProblemAlert message={state.error} /> : null}
    </form>
  );
}

function PencilIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
    </svg>
  );
}
