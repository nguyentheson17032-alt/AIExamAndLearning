import { PageHeader } from "@/components/page-header";
import { SubjectCreateForm } from "@/components/subject-create-form";
import { requireTeacher } from "@/lib/guards";

export default async function NewSubjectPage() {
  await requireTeacher();
  return (
    <>
      <PageHeader title="New subject" />
      <SubjectCreateForm />
    </>
  );
}
