"use server";

import { backendFetch, errorMessage } from "@/lib/backend";
import { requireUser } from "@/lib/guards";
import { getSessionUser, persistSessionUser } from "@/lib/session";
import type { Attempt, UserProfile } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type AttemptFormState = { error: string } | null;

export async function submitAttemptAction(
  attemptId: string,
  _prev: AttemptFormState,
  formData: FormData,
): Promise<AttemptFormState> {
  await requireUser();
  const questionIds = formData.getAll("questionId").map((value) => String(value));
  const answers = questionIds.map((questionId) => {
    const selected = String(formData.get(`choice-${questionId}`) ?? "");
    const text = String(formData.get(`text-${questionId}`) ?? "").trim();
    return {
      questionId,
      selectedChoiceId: selected || null,
      textAnswer: text || null,
    };
  });
  try {
    await backendFetch<Attempt>(`/api/v1/attempts/${attemptId}/submit`, {
      method: "POST",
      body: JSON.stringify({ answers }),
    });
    const session = await getSessionUser();
    if (session) {
      const profile = await backendFetch<UserProfile>("/api/v1/me");
      await persistSessionUser({
        ...session,
        displayName: profile.displayName,
        role: profile.role,
        eloRating: profile.eloRating,
        rankCode: profile.rankCode,
      });
    }
  } catch (error) {
    return { error: errorMessage(error, "Submit failed") };
  }
  revalidatePath("/", "layout");
  revalidatePath("/attempts");
  revalidatePath("/me");
  redirect(`/attempts/${attemptId}`);
}
