import { PageHeader } from "@/components/page-header";
import { QuestionCreateForm } from "@/components/question-create-form";
import { backendFetch } from "@/lib/backend";
import { requireTeacher } from "@/lib/guards";
import type { PageResponse, Subject } from "@/lib/types";

export default async function NewQuestionPage() {
  await requireTeacher();
  const subjects = await backendFetch<PageResponse<Subject>>("/api/v1/subjects?size=100");
  return (
    <>
      <PageHeader title="New question" />
      <QuestionCreateForm subjects={subjects.content} />
    </>
  );
}
