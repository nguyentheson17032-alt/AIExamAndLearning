import { PageHeader } from "@/components/page-header";
import { QuestionUploadForm } from "@/components/question-upload-form";
import { requireTeacher } from "@/lib/guards";

export default async function UploadQuestionsPage() {
  await requireTeacher();
  return (
    <>
      <PageHeader title="Batch upload" description="POST /api/v1/questions/upload from a JSON array." />
      <QuestionUploadForm />
    </>
  );
}
