import { PageHeader } from "@/components/page-header";
import { PaperCreateForm } from "@/components/paper-create-form";
import { backendFetch } from "@/lib/backend";
import { examBanks } from "@/lib/exam-bank";
import { requireTeacher } from "@/lib/guards";
import { loadAllPapers } from "@/lib/load-papers";
import type { ClassroomSummary, PageResponse, Subject } from "@/lib/types";

export default async function NewPaperPage() {
  await requireTeacher();
  const [subjects, papers, classrooms] = await Promise.all([
    backendFetch<PageResponse<Subject>>("/api/v1/subjects?size=100"),
    loadAllPapers(),
    backendFetch<ClassroomSummary[]>("/api/v1/classrooms"),
  ]);
  return (
    <>
      <PageHeader
        title="Tạo đề"
        description="Nhập tên đề, chọn môn, chọn đủ câu Phần I, II, III, rồi chỉnh Elo."
      />
      <PaperCreateForm subjects={subjects.content} banks={examBanks(papers)} classrooms={classrooms} />
    </>
  );
}
