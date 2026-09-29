import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { PaperCreateForm } from "@/components/paper-create-form";
import { QuestionBankBrowser } from "@/components/question-bank-browser";
import { backendFetch } from "@/lib/backend";
import { examBanks } from "@/lib/exam-bank";
import { requireTeacher } from "@/lib/guards";
import { loadAllPapers } from "@/lib/load-papers";
import type { ClassroomSummary, PageResponse, Subject } from "@/lib/types";

export default async function QuestionsPage() {
  await requireTeacher();
  const [subjects, papers, classrooms] = await Promise.all([
    backendFetch<PageResponse<Subject>>("/api/v1/subjects?size=100"),
    loadAllPapers(),
    backendFetch<ClassroomSummary[]>("/api/v1/classrooms"),
  ]);
  const nameById = new Map(subjects.content.map((subject) => [subject.id, subject.name]));
  const banks = examBanks(papers);
  const rows = banks
    .map((bank) => ({ id: bank.subjectId, name: nameById.get(bank.subjectId) ?? "Môn", bank }))
    .toSorted((a, b) => a.name.localeCompare(b.name, "vi"));

  return (
    <>
      <PageHeader title="Câu hỏi" description="Bấm môn, rồi bấm Phần I, II hoặc III để xem câu hỏi trong bộ đề đã tải lên.">
        <a href="#tao-de" className="rounded-md bg-accent px-3 py-2 text-sm text-white hover:bg-accent-hover">
          Tạo đề
        </a>
      </PageHeader>
      {rows.length === 0 ? (
        <EmptyState title="Chưa có câu hỏi" description="Tải một bộ đề để xem câu hỏi theo từng phần." />
      ) : (
        <QuestionBankBrowser rows={rows} />
      )}
      <section id="tao-de" className="mt-10 space-y-4">
        <h2 className="text-lg font-semibold">Tạo đề</h2>
        <p className="text-sm text-muted">
          Nhập tên đề, chọn môn, rồi chọn từng phần. Đủ số câu thì phần đó đóng và mở phần tiếp theo.
        </p>
        <PaperCreateForm subjects={subjects.content} banks={banks} classrooms={classrooms} />
      </section>
    </>
  );
}
