"use server";

import { backendFetch, errorMessage } from "@/lib/backend";
import { requireTeacher, requireUser } from "@/lib/guards";
import { aiPracticeDurationMinutes } from "@/lib/ai-practice";
import { getSessionUser, persistSessionUser } from "@/lib/session";
import type { Attempt, MathCategory, MathDifficulty, MathEvaluateResult, MathExercise, Paper, Question, UserProfile, AiPredictResponse } from "@/lib/types";
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
  const questionCount = Number(formData.get("questionCount") ?? 5);
  const payload = {
    subjectId: String(formData.get("subjectId") ?? ""),
    questionCount,
    durationMinutes: aiPracticeDurationMinutes(questionCount),
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
  let attempt: Attempt;
  try {
    attempt = await backendFetch<Attempt>(`/api/v1/papers/${paper.id}/attempts`, {
      method: "POST",
    });
  } catch (error) {
    return { error: errorMessage(error, "Không bắt đầu được đề thi") };
  }
  redirect(`/attempts/${attempt.id}`);
}

export async function adjustEloAction(attemptId: string): Promise<AiFormState> {
  await requireUser();
  try {
    const profile = await backendFetch<UserProfile>(`/api/v1/ai/attempts/${attemptId}/elo`, { method: "POST" });
    const session = await getSessionUser();
    if (session) {
      await persistSessionUser({
        ...session,
        displayName: profile.displayName,
        role: profile.role,
        eloRating: profile.eloRating,
        rankCode: profile.rankCode,
      });
    }
    revalidatePath("/", "layout");
    revalidatePath("/me");
    revalidatePath(`/attempts/${attemptId}`);
    return { error: "", message: "Elo adjusted." };
  } catch (error) {
    return { error: errorMessage(error, "Elo adjustment failed") };
  }
}

export async function chatTutorAction(query: string, currentProblem?: unknown): Promise<{ reply: string; error?: string }> {
  await requireUser();
  try {
    const res = await backendFetch<{ success: boolean; reply: string }>("/api/v1/ai/tutor/chat", {
      method: "POST",
      body: JSON.stringify({ query, currentProblem }),
    });
    return { reply: res.reply || "Không nhận được phản hồi từ AI." };
  } catch (error) {
    return { reply: "", error: errorMessage(error, "Lỗi kết nối AI Tutor") };
  }
}

export async function evaluateMathAction(problem: unknown, userAnswer: string): Promise<{ result?: MathEvaluateResult; error?: string }> {
  await requireUser();
  try {
    const res = await backendFetch<{ success: boolean; result?: MathEvaluateResult }>("/api/v1/ai/tutor/evaluate", {
      method: "POST",
      body: JSON.stringify({ problem, userAnswer, user_answer: userAnswer }),
    }).catch(async () => {
      const probObj = (problem && typeof problem === "object") ? (problem as Record<string, unknown>) : {};
      const sName = String(probObj.subject_name || probObj.subjectName || "");
      const cat = String(probObj.category || "");
      const isPhysics = /vật l[yí]|phys/i.test(sName) || /phy|mechanics|oscillation|circuits|optics|thermo|nuclear/i.test(cat);
      const evalPort = isPhysics ? 8001 : 8000;

      // Direct call fallback to Physics (8001) or Math (8000) Server
      const resp = await fetch(`http://localhost:${evalPort}/api/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem, user_answer: userAnswer, userAnswer }),
        cache: "no-store",
      });
      return await resp.json();
    });
    if (res && res.result) {
      return { result: res.result };
    }
    return { error: "Không thể chấm bài." };
  } catch (error) {
    return { error: errorMessage(error, "Lỗi chấm bài AI") };
  }
}

export async function getAiPredictAction(x: number): Promise<{ data?: AiPredictResponse; error?: string }> {
  await requireUser();
  try {
    const res = await backendFetch<{ success: boolean; data?: AiPredictResponse }>(`/api/v1/ai/tutor/predict?x=${x}`);
    if (res.data) {
      return { data: res.data };
    }
    return { error: "Không lấy được dữ liệu dự đoán." };
  } catch (error) {
    return { error: errorMessage(error, "Lỗi dự đoán mô hình AI") };
  }
}

export async function generateMathExercisesAction(
  category: MathCategory = "all",
  difficulty: MathDifficulty = "medium",
  count: number = 3,
  elo?: number,
  subjectName: string = "Toán",
): Promise<{ exercises?: MathExercise[]; paperId?: string; paperTitle?: string; paperSetId?: string; paperSetTitle?: string; error?: string }> {
  await requireUser();
  try {
    const isPhysics = /vật l[yí]|phys/i.test(subjectName) || /phy|mechanics|oscillation|circuits|optics|thermo|nuclear/i.test(category);
    const resolvedSubject = isPhysics ? "Vật lý" : subjectName;
    const targetPort = isPhysics ? 8001 : 8000;

    const res = await backendFetch<{ success: boolean; exercises: MathExercise[]; paperId?: string; paperTitle?: string; paperSetId?: string; paperSetTitle?: string }>("/api/v1/ai/tutor/generate", {
      method: "POST",
      body: JSON.stringify({ category, difficulty, count, elo, subject_name: resolvedSubject, subjectName: resolvedSubject }),
    }).catch(async () => {
      // Direct call fallback to dedicated microservice
      const resp = await fetch(`http://localhost:${targetPort}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, difficulty, count, elo, subject_name: resolvedSubject, subjectName: resolvedSubject }),
        cache: "no-store",
      });
      return await resp.json();
    });

    revalidatePath("/papers");
    revalidatePath("/subjects");
    revalidatePath("/papers/group/practice");

    return {
      exercises: res?.exercises || [],
      paperId: res?.paperId,
      paperTitle: res?.paperTitle,
      paperSetId: res?.paperSetId,
      paperSetTitle: res?.paperSetTitle,
    };
  } catch (error) {
    return { error: errorMessage(error, "Không thể sinh bài tập") };
  }
}


export async function generateMathToBankAction(
  _prev: AiFormState,
  formData: FormData,
): Promise<AiFormState> {
  await requireTeacher();
  const subjectId = String(formData.get("subjectId") || "");
  const topicId = formData.get("topicId") ? String(formData.get("topicId")) : undefined;
  const category = String(formData.get("category") || "all");
  const difficulty = String(formData.get("difficulty") || "medium");
  const count = Number(formData.get("count") || 3);

  if (!subjectId) {
    return { error: "Vui lòng chọn môn học." };
  }

  try {
    await backendFetch<Question[]>("/api/v1/ai/math/generate-bank", {
      method: "POST",
      body: JSON.stringify({
        subjectId,
        topicId: topicId || null,
        category,
        difficulty,
        count,
      }),
    });
    revalidatePath("/questions");
    return { error: "", message: `Đã sinh thành công ${count} câu hỏi Toán vào Ngân hàng đề!` };
  } catch (error) {
    return { error: errorMessage(error, "Sinh câu hỏi vào ngân hàng thất bại") };
  }
}

