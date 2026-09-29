import { EmptyState } from "@/components/empty-state";
import { QuestionExamCreator } from "@/components/question-exam-creator";
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
    <QuestionExamCreator subjects={subjects.content} banks={banks} classrooms={classrooms}>
      {rows.length === 0 ? (
        <EmptyState title="Chưa có câu hỏi" description="Tải một bộ đề để xem câu hỏi theo từng phần." />
      ) : (
        <QuestionBankBrowser rows={rows} />
      )}
    </QuestionExamCreator>
  );
}
