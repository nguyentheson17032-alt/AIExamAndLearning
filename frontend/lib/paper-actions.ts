"use server";

import { backendFetch, errorMessage } from "@/lib/backend";
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
  const questionIds = formData.getAll("questionId").map((value) => String(value)).filter(Boolean);
  if (questionIds.length === 0) {
    return { error: "Select at least one question." };
  }
  const payload = {
    subjectId: String(formData.get("subjectId") ?? ""),
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || null,
    kind: String(formData.get("kind") ?? "EXAM"),
    source: "MANUAL",
    durationMinutes: Number(formData.get("durationMinutes") ?? 45),
    targetEloMin: Number(formData.get("targetEloMin") ?? 800),
    targetEloMax: Number(formData.get("targetEloMax") ?? 1400),
    status: "PUBLISHED",
    questions: questionIds.map((questionId) => ({ questionId, points: 1 })),
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
  redirect(`/papers/${paper.id}`);
}

export async function generatePaperAction(
  _prev: PaperFormState,
  formData: FormData,
): Promise<PaperFormState> {
  await requireTeacher();
  const payload = {
    subjectId: String(formData.get("subjectId") ?? ""),
    kind: String(formData.get("kind") ?? "PRACTICE"),
    questionCount: Number(formData.get("questionCount") ?? 5),
    durationMinutes: Number(formData.get("durationMinutes") ?? 30),
    targetEloMin: Number(formData.get("targetEloMin") ?? 800),
    targetEloMax: Number(formData.get("targetEloMax") ?? 1400),
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

export async function startAttemptAction(paperId: string): Promise<void> {
  await requireUser();
  const attempt = await backendFetch<Attempt>(`/api/v1/papers/${paperId}/attempts`, {
    method: "POST",
  });
  redirect(`/attempts/${attempt.id}`);
}

export async function startPracticeAction(
  _prev: PaperFormState,
  formData: FormData,
): Promise<PaperFormState> {
  await requireUser();
  const payload = {
    subjectId: String(formData.get("subjectId") ?? ""),
    questionCount: Number(formData.get("questionCount") ?? 5),
    durationMinutes: Number(formData.get("durationMinutes") ?? 20),
  };
  let attempt: Attempt;
  try {
    attempt = await backendFetch<Attempt>("/api/v1/practice/sessions", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch (error) {
    return { error: errorMessage(error, "Could not start practice") };
  }
  redirect(`/attempts/${attempt.id}`);
}
