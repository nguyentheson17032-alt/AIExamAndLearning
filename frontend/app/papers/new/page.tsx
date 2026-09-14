import { PageHeader } from "@/components/page-header";
import { PaperCreateForm } from "@/components/paper-create-form";
import { backendFetch } from "@/lib/backend";
import { requireTeacher } from "@/lib/guards";
import type { PageResponse, Question, Subject } from "@/lib/types";

export default async function NewPaperPage() {
  await requireTeacher();
  const [subjects, questions] = await Promise.all([
    backendFetch<PageResponse<Subject>>("/api/v1/subjects?size=100"),
    backendFetch<PageResponse<Question>>("/api/v1/questions?status=PUBLISHED&size=50"),
  ]);
  return (
    <>
      <PageHeader title="Create paper" description="Pick published questions and set an Elo range." />
      <PaperCreateForm subjects={subjects.content} questions={questions.content} />
    </>
  );
}
