"use server";

import { backendFetch, errorMessage, rethrowIfRedirect } from "@/lib/backend";
import { requireTeacher } from "@/lib/guards";
import type {
  AdminAiExam,
  AdminClassroom,
  AdminClassroomDetail,
  AdminStats,
  AdminStudent,
  AdminStudentDetail,
  AdminTeacher,
  ContentStatus,
} from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function fetchAdminStats(): Promise<AdminStats> {
  try {
    return await backendFetch<AdminStats>("/api/v1/admin/stats");
  } catch (err) {
    rethrowIfRedirect(err);
    return {
      totalStudents: 0,
      totalTeachers: 0,
      totalClassrooms: 0,
      totalQuestions: 0,
      totalPapers: 0,
      totalAiExams: 0,
      totalAttempts: 0,
      rankDistribution: {
        BRONZE: 0,
        SILVER: 0,
        GOLD: 0,
        PLATINUM: 0,
        DIAMOND: 0,
      },
    };
  }
}

export async function fetchAdminStudents(query?: string): Promise<AdminStudent[]> {
  const searchParam = query ? `?query=${encodeURIComponent(query)}` : "";
  try {
    return await backendFetch<AdminStudent[]>(`/api/v1/admin/students${searchParam}`);
  } catch (err) {
    rethrowIfRedirect(err);
    return [];
  }
}

export async function fetchAdminStudentDetails(studentId: string): Promise<AdminStudentDetail | null> {
  try {
    return await backendFetch<AdminStudentDetail>(`/api/v1/admin/students/${studentId}/details`);
  } catch (err) {
    rethrowIfRedirect(err);
    return null;
  }
}

export async function fetchAdminTeachers(query?: string): Promise<AdminTeacher[]> {
  const searchParam = query ? `?query=${encodeURIComponent(query)}` : "";
  try {
    return await backendFetch<AdminTeacher[]>(`/api/v1/admin/teachers${searchParam}`);
  } catch (err) {
    rethrowIfRedirect(err);
    return [];
  }
}

export async function fetchAdminClassrooms(): Promise<AdminClassroom[]> {
  try {
    return await backendFetch<AdminClassroom[]>("/api/v1/admin/classrooms");
  } catch (err) {
    rethrowIfRedirect(err);
    return [];
  }
}

export async function fetchAdminClassroomDetails(classroomId: string): Promise<AdminClassroomDetail | null> {
  try {
    return await backendFetch<AdminClassroomDetail>(`/api/v1/admin/classrooms/${classroomId}/details`);
  } catch (err) {
    rethrowIfRedirect(err);
    return null;
  }
}

export async function fetchAdminAiExams(): Promise<AdminAiExam[]> {
  try {
    return await backendFetch<AdminAiExam[]>("/api/v1/admin/ai-exams");
  } catch (err) {
    rethrowIfRedirect(err);
    return [];
  }
}

export async function togglePaperStatusAction(paperId: string, status: ContentStatus): Promise<{ success: boolean; error?: string }> {
  await requireTeacher();
  try {
    await backendFetch(`/api/v1/admin/papers/${paperId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
    revalidatePath("/admin/ai-exams");
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    return { success: false, error: errorMessage(err, "Không thể cập nhật trạng thái đề thi") };
  }
}

export async function toggleUserStatusAction(userId: string, enabled: boolean): Promise<{ success: boolean; error?: string }> {
  await requireTeacher();
  try {
    await backendFetch(`/api/v1/admin/users/${userId}/status`, {
      method: "PUT",
      body: JSON.stringify({ enabled }),
    });
    revalidatePath("/admin/students");
    revalidatePath("/admin/teachers");
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    return { success: false, error: errorMessage(err, "Không thể cập nhật trạng thái người dùng") };
  }
}

export async function updateStudentEloAction(userId: string, eloRating: number): Promise<{ success: boolean; error?: string }> {
  await requireTeacher();
  try {
    await backendFetch(`/api/v1/admin/users/${userId}/elo`, {
      method: "PUT",
      body: JSON.stringify({ eloRating }),
    });
    revalidatePath("/admin/students");
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    return { success: false, error: errorMessage(err, "Không thể cập nhật Elo của học sinh") };
  }
}
