import { backendFetch } from "@/lib/backend";
import { requireUser } from "@/lib/guards";
import type { PaperSet } from "@/lib/types";
import { redirect } from "next/navigation";

export default async function ExamSetRedirectPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const set = await backendFetch<PaperSet>(`/api/v1/paper-sets/${id}`);
  redirect(`/subjects/${set.subjectId}/sets/${set.id}`);
}
