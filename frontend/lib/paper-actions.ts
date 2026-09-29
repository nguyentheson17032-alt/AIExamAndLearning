"use server";

import { backendFetch, errorMessage, rethrowIfRedirect } from "@/lib/backend";
import { buildExamQuestions } from "@/lib/exam-bank";
import { requireTeacher, requireUser } from "@/lib/guards";
import type { Attempt, Paper } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type PaperFormState = { error: string } | null;

export async function createPaperAction(
  _prev: PaperFormState,
  formData: FormData,
): Promise<PaperFormState> {
  await requireTeacher();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) {
    return { error: "Nhập tên đề." };
  }
  const targetEloMin = Number(formData.get("targetEloMin") ?? 1000);
  const targetEloMax = Number(formData.get("targetEloMax") ?? 1400);
  if (!Number.isFinite(targetEloMin) || !Number.isFinite(targetEloMax) || targetEloMin > targetEloMax) {
    return { error: "Elo tối thiểu phải nhỏ hơn hoặc bằng Elo tối đa." };
  }
  const built = buildExamQuestions({
    partOneIds: formData.getAll("partOne").map(String).filter(Boolean),
    partTwoGroups: formData
      .getAll("partTwo")
      .map((value) => String(value).split(",").filter(Boolean))
      .filter((group) => group.length > 0),
    partThreeIds: formData.getAll("partThree").map(String).filter(Boolean),
  });
  if ("error" in built) {
    return { error: built.error };
  }
  const payload = {
    subjectId: String(formData.get("subjectId") ?? ""),
    title,
    description: null,
    kind: "EXAM",
    source: "MANUAL",
    durationMinutes: built.durationMinutes,
    targetEloMin,
    targetEloMax,
    status: "PUBLISHED",
    questions: built.questions,
    classroomId: String(formData.get("classroomId") ?? "").trim() || null,
  };
  let paper: Paper;
  try {
    paper = await backendFetch<Paper>("/api/v1/papers", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch (error) {
    return { error: errorMessage(error, "Could not create paper") };
  }
  revalidatePath("/papers");
  if (payload.classroomId) {
    revalidatePath(`/classrooms/${payload.classroomId}`);
  }
  redirect(`/papers/${paper.id}`);
}

export async function generatePaperAction(
  _prev: PaperFormState,
  formData: FormData,
): Promise<PaperFormState> {
  await requireTeacher();
  const payload = {
    subjectId: String(formData.get("subjectId") ?? ""),
    kind: "PRACTICE",
    section: String(formData.get("section") ?? "PART_I"),
    questionCount: Number(formData.get("questionCount") ?? 5),
    durationMinutes: Number(formData.get("durationMinutes") ?? 10),
    targetEloMin: Number(formData.get("targetEloMin") ?? 1000),
    targetEloMax: Number(formData.get("targetEloMax") ?? 1100),
    title: String(formData.get("title") ?? "").trim() || null,
  };
  let paper: Paper;
  try {
    paper = await backendFetch<Paper>("/api/v1/papers/generate", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch (error) {
    return { error: errorMessage(error, "Could not generate paper") };
  }
  revalidatePath("/papers");
  redirect(`/papers/${paper.id}`);
}

export async function startAttemptAction(paperId: string): Promise<PaperFormState> {
  await requireUser();
  let attempt: Attempt;
  try {
    attempt = await backendFetch<Attempt>(`/api/v1/papers/${paperId}/attempts`, {
      method: "POST",
    });
  } catch (error) {
    rethrowIfRedirect(error);
    return { error: errorMessage(error, "Không bắt đầu được đề thi") };
  }
  redirect(`/attempts/${attempt.id}`);
}
