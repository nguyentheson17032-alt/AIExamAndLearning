import { PageHeader } from "@/components/page-header";
import { PaperGenerateForm } from "@/components/paper-generate-form";
import { backendFetch } from "@/lib/backend";
import { requireTeacher } from "@/lib/guards";
import type { PageResponse, Subject } from "@/lib/types";

export default async function GeneratePaperPage() {
  await requireTeacher();
  const subjects = await backendFetch<PageResponse<Subject>>("/api/v1/subjects?size=100");
  return (
    <>
      <PageHeader title="Generate paper" description="Auto-build from questions in an Elo range." />
      <PaperGenerateForm subjects={subjects.content} />
    </>
  );
}
