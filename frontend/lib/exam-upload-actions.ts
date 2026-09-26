"use server";

import { backendFetch, errorMessage, rethrowIfRedirect } from "@/lib/backend";
import { requireTeacher } from "@/lib/guards";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type ExamUploadState = { error: string } | null;

export async function importExamAction(
  subjectId: string,
  _previous: ExamUploadState,
  formData: FormData,
): Promise<ExamUploadState> {
  await requireTeacher();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Chọn file đề .docx." };
  }
  if (!file.name.toLowerCase().endsWith(".docx")) {
    return { error: "Chỉ nhận file Word .docx." };
  }
  const body = new FormData();
  body.set("subjectId", subjectId);
  const title = String(formData.get("title") ?? "").trim();
  if (title) {
    body.set("title", title);
  }
  body.set("file", file);
  try {
    await backendFetch(`/api/v1/paper-sets/import`, { method: "POST", body });
  } catch (error) {
    rethrowIfRedirect(error);
    return { error: errorMessage(error, "Không tải được đề.") };
  }
  revalidatePath(`/subjects/${subjectId}`);
  redirect(`/subjects/${subjectId}`);
}
