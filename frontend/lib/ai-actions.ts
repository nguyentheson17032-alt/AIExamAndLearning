"use server";

import { backendFetch, errorMessage } from "@/lib/backend";
import { requireTeacher, requireUser } from "@/lib/guards";
import type { Paper, Question, UserProfile } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type AiFormState = { error: string; message?: string } | null;

export async function classifyQuestionAction(questionId: string): Promise<AiFormState> {
  await requireTeacher();
  try {
    await backendFetch<Question>(`/api/v1/ai/questions/${questionId}/classify`, { method: "POST" });
    revalidatePath(`/questions/${questionId}`);
    return { error: "", message: "Classification updated." };
  } catch (error) {
    return { error: errorMessage(error, "Classify failed") };
  }
}

export async function generateSimilarAction(questionId: string): Promise<AiFormState> {
  await requireTeacher();
  try {
    await backendFetch<Question[]>(`/api/v1/ai/questions/${questionId}/similar`, {
      method: "POST",
      body: JSON.stringify({ count: 3 }),
    });
    revalidatePath("/questions");
    return { error: "", message: "Similar questions created." };
  } catch (error) {
    return { error: errorMessage(error, "Similar generation failed") };
  }
}

export async function generateAiPracticeAction(
  _prev: AiFormState,
  formData: FormData,
): Promise<AiFormState> {
  await requireTeacher();
  const payload = {
    subjectId: String(formData.get("subjectId") ?? ""),
    questionCount: Number(formData.get("questionCount") ?? 5),
    durationMinutes: Number(formData.get("durationMinutes") ?? 25),
  };
  let paper: Paper;
  try {
    paper = await backendFetch<Paper>("/api/v1/ai/papers/practice", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch (error) {
    return { error: errorMessage(error, "AI practice paper failed") };
  }
  revalidatePath("/papers");
  redirect(`/papers/${paper.id}`);
}

export async function adjustEloAction(attemptId: string): Promise<AiFormState> {
  await requireUser();
  try {
    await backendFetch<UserProfile>(`/api/v1/ai/attempts/${attemptId}/elo`, { method: "POST" });
    revalidatePath("/me");
    revalidatePath(`/attempts/${attemptId}`);
    return { error: "", message: "Elo adjusted." };
  } catch (error) {
    return { error: errorMessage(error, "Elo adjustment failed") };
  }
}
