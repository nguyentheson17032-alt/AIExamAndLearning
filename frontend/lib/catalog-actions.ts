"use server";

import { backendFetch, errorMessage } from "@/lib/backend";
import { requireTeacher } from "@/lib/guards";
import type { Subject, Topic } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type CatalogFormState = { error: string } | null;

export async function createSubjectAction(
  _prev: CatalogFormState,
  formData: FormData,
): Promise<CatalogFormState> {
  await requireTeacher();
  const code = String(formData.get("code") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  let subject: Subject;
  try {
    subject = await backendFetch<Subject>("/api/v1/subjects", {
      method: "POST",
      body: JSON.stringify({ code, name, description }),
    });
  } catch (error) {
    return { error: errorMessage(error, "Could not create subject") };
  }
  revalidatePath("/subjects");
  redirect(`/subjects/${subject.id}`);
}

export async function createTopicAction(
  subjectId: string,
  _prev: CatalogFormState,
  formData: FormData,
): Promise<CatalogFormState> {
  await requireTeacher();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  try {
    await backendFetch<Topic>(`/api/v1/subjects/${subjectId}/topics`, {
      method: "POST",
      body: JSON.stringify({ name, description }),
    });
    revalidatePath(`/subjects/${subjectId}`);
    return null;
  } catch (error) {
    return { error: errorMessage(error, "Could not create topic") };
  }
}
