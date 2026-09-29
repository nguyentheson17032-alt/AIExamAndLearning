"use client";

import { PageHeader } from "@/components/page-header";
import { PaperCreateForm } from "@/components/paper-create-form";
import type { SubjectBank } from "@/lib/exam-bank";
import type { ClassroomSummary, Subject } from "@/lib/types";
import { useEffect, useRef, useState } from "react";

export function QuestionExamCreator({
  subjects,
  banks,
  classrooms,
  children,
}: {
  subjects: Subject[];
  banks: SubjectBank[];
  classrooms: ClassroomSummary[];
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLElement>(null);

  useEffect(() => {
    if (open) {
      panel.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [open]);

  return (
    <>
      <PageHeader
        title="Câu hỏi"
        description="Bấm môn, rồi bấm Phần I, II hoặc III để xem câu hỏi trong bộ đề đã tải lên."
      >
        <button
          type="button"
          className="rounded-md bg-accent px-3 py-2 text-sm text-white hover:bg-accent-hover"
          onClick={() => setOpen(true)}
        >
          Tạo đề
        </button>
      </PageHeader>
      {children}
      {open ? (
        <section ref={panel} className="mt-10 space-y-4">
          <h2 className="text-lg font-semibold">Tạo đề</h2>
          <p className="text-sm text-muted">
            Nhập tên đề, chọn môn, rồi chọn từng phần. Đủ số câu thì phần đó đóng và mở phần tiếp theo.
          </p>
          <PaperCreateForm subjects={subjects} banks={banks} classrooms={classrooms} />
        </section>
      ) : null}
    </>
  );
}
