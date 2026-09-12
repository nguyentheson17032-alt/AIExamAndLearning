"use server";

import { backendFetch, errorMessage } from "@/lib/backend";
import { requireTeacher } from "@/lib/guards";
import type { Question } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type QuestionFormState = { error: string } | null;

function choicePayload(formData: FormData) {
  const labels = formData.getAll("choiceLabel").map((value) => String(value).trim());
  const contents = formData.getAll("choiceContent").map((value) => String(value));
  const correctIndex = Number(formData.get("correctChoice") ?? -1);
  return labels
    .map((label, index) => ({
      label,
      content: contents[index] ?? "",
      correct: index === correctIndex,
    }))
    .filter((choice) => choice.label && choice.content);
}

export async function createQuestionAction(
  _prev: QuestionFormState,
  formData: FormData,
): Promise<QuestionFormState> {
  await requireTeacher();
  const type = String(formData.get("type") ?? "MULTIPLE_CHOICE");
  const payload = {
    subjectId: String(formData.get("subjectId") ?? ""),
    topicId: String(formData.get("topicId") ?? "") || null,
    type,
    stem: String(formData.get("stem") ?? "").trim(),
    answerKey: String(formData.get("answerKey") ?? "").trim() || null,
    explanation: String(formData.get("explanation") ?? "").trim() || null,
    difficulty: String(formData.get("difficulty") ?? "INTERMEDIATE"),
    eloRating: Number(formData.get("eloRating") ?? 1000),
    bloomLevel: String(formData.get("bloomLevel") ?? "") || null,
    source: "MANUAL",
    status: String(formData.get("status") ?? "PUBLISHED"),
    choices: type === "SHORT_ANSWER" || type === "ESSAY" ? [] : choicePayload(formData),
  };
  let question: Question;
  try {
    question = await backendFetch<Question>("/api/v1/questions", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch (error) {
    return { error: errorMessage(error, "Could not create question") };
  }
  revalidatePath("/questions");
  redirect(`/questions/${question.id}`);
}

export async function uploadQuestionsAction(
  _prev: QuestionFormState,
  formData: FormData,
): Promise<QuestionFormState> {
  await requireTeacher();
  const raw = String(formData.get("json") ?? "").trim();
  try {
    const parsed = JSON.parse(raw) as unknown;
    const questions = Array.isArray(parsed) ? parsed : (parsed as { questions?: unknown }).questions;
    if (!Array.isArray(questions)) {
      return { error: "JSON must be an array or { questions: [] }." };
    }
    await backendFetch("/api/v1/questions/upload", {
      method: "POST",
      body: JSON.stringify({ questions }),
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return { error: "Invalid JSON." };
    }
    return { error: errorMessage(error, "Upload failed") };
  }
  revalidatePath("/questions");
  redirect("/questions");
}

export async function archiveQuestionAction(questionId: string): Promise<void> {
  await requireTeacher();
  await backendFetch(`/api/v1/questions/${questionId}`, { method: "DELETE" });
  revalidatePath("/questions");
  redirect("/questions");
}
