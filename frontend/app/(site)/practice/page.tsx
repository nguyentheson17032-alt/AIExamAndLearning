import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { PracticeForm } from "@/components/practice-form";
import { backendFetch } from "@/lib/backend";
import { requireUser } from "@/lib/guards";
import type { PageResponse, Subject } from "@/lib/types";

export default async function PracticePage() {
  await requireUser();
  const subjects = await backendFetch<PageResponse<Subject>>("/api/v1/subjects?size=100");
  return (
    <>
      <PageHeader title="Elo practice" description="The API picks questions near your current rating." />
      {subjects.content.length === 0 ? (
        <EmptyState title="No subjects" description="A teacher needs to create a subject first." />
      ) : (
        <PracticeForm subjects={subjects.content} />
      )}
    </>
  );
}
