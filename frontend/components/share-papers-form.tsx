"use client";

import { sharePapersAction, type ClassroomFormState } from "@/lib/classroom-actions";
import { ProblemAlert } from "@/components/problem-alert";
import { SubmitButton } from "@/components/submit-button";
import type { ClassPaper, SharePaperSetOption } from "@/lib/types";
import { useActionState } from "react";

export function SharePapersForm({
  classroomId,
  papers,
  paperSets,
}: {
  classroomId: string;
  papers: ClassPaper[];
  paperSets: SharePaperSetOption[];
}) {
  const [state, action] = useActionState(sharePapersAction.bind(null, classroomId), null as ClassroomFormState);
  const empty = papers.length === 0 && paperSets.length === 0;

  return (
    <form action={action} className="space-y-4 rounded-xl border border-line bg-card p-6">
      <div>
        <h2 className="font-medium">Đưa đề vào lớp</h2>
        <p className="mt-1 text-sm text-muted">Chọn đề lẻ hoặc bộ đề tải từ file Word. Có thể chọn nhiều mục.</p>
      </div>
      {state?.error ? <ProblemAlert message={state.error} /> : null}
      {state?.message ? <p className="text-sm text-muted">{state.message}</p> : null}
      {empty ? (
        <p className="text-sm text-muted">Mọi đề và bộ đề của bạn đã có trong lớp.</p>
      ) : (
        <>
          {paperSets.length > 0 ? (
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Bộ đề</legend>
              <ul className="max-h-64 space-y-2 overflow-y-auto">
                {paperSets.map((set) => (
                  <li key={set.id}>
                    <label className="flex items-start gap-2 text-sm">
                      <input type="checkbox" name="paperSetId" value={set.id} className="mt-1" />
                      <span>
                        {set.title}
                        <span className="text-muted">
                          {" "}
                          · {set.paperCount} đề{set.academicYear ? ` · ${set.academicYear}` : ""}
                        </span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </fieldset>
          ) : null}
          {papers.length > 0 ? (
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Đề lẻ</legend>
              <ul className="max-h-64 space-y-2 overflow-y-auto">
                {papers.map((paper) => (
                  <li key={paper.id}>
                    <label className="flex items-start gap-2 text-sm">
                      <input type="checkbox" name="paperId" value={paper.id} className="mt-1" />
                      <span>
                        {paper.title}
                        <span className="text-muted"> · {paper.durationMinutes} phút</span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </fieldset>
          ) : null}
          <SubmitButton pendingLabel="Đang đưa bài…">Đưa vào lớp</SubmitButton>
        </>
      )}
    </form>
  );
}
