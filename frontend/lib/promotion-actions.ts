"use server";

import { backendFetch, errorMessage, rethrowIfRedirect } from "@/lib/backend";
import { requireUser } from "@/lib/guards";
import type { Attempt, PromotionStatusResponse } from "@/lib/types";
import { redirect } from "next/navigation";

export async function getPromotionStatusAction(): Promise<PromotionStatusResponse | null> {
  await requireUser();
  try {
    return await backendFetch<PromotionStatusResponse>("/api/v1/me/promotion");
  } catch {
    return null;
  }
}

export async function startPromotionExamAction(subjectId?: string): Promise<{ error?: string }> {
  await requireUser();
  let attemptId: string | null = null;
  try {
    const attempt = await backendFetch<Attempt>("/api/v1/me/promotion/start", {
      method: "POST",
      body: JSON.stringify({ subjectId: subjectId || null }),
    });
    attemptId = attempt.id;
  } catch (error) {
    rethrowIfRedirect(error);
    return { error: errorMessage(error, "Không thể bắt đầu bài thi thăng hạng.") };
  }

  if (attemptId) {
    redirect(`/attempts/${attemptId}`);
  }
  return {};
}
