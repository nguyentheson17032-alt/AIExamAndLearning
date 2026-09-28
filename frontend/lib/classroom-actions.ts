"use server";

import { backendFetch, errorMessage } from "@/lib/backend";
import { requireTeacher } from "@/lib/guards";
import type { ClassroomMember, ClassroomSummary } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type ClassroomFormState = { error?: string; message?: string } | null;

export async function createClassroomAction(
  _prev: ClassroomFormState,
  formData: FormData,
): Promise<ClassroomFormState> {
  await requireTeacher();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return { error: "Nhập tên lớp." };
  }
  let classroom: ClassroomSummary;
  try {
    classroom = await backendFetch<ClassroomSummary>("/api/v1/classrooms", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  } catch (error) {
    return { error: errorMessage(error, "Không tạo được lớp") };
  }
  revalidatePath("/classrooms");
  redirect(`/classrooms/${classroom.id}`);
}

export async function renameClassroomAction(
  classroomId: string,
  _prev: ClassroomFormState,
  formData: FormData,
): Promise<ClassroomFormState> {
  await requireTeacher();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return { error: "Nhập tên lớp." };
  }
  try {
    await backendFetch<ClassroomSummary>(`/api/v1/classrooms/${classroomId}`, {
      method: "PUT",
      body: JSON.stringify({ name }),
    });
  } catch (error) {
    return { error: errorMessage(error, "Không đổi được tên lớp") };
  }
  revalidatePath(`/classrooms/${classroomId}`);
  revalidatePath("/classrooms");
  return { message: "Đã đổi tên lớp." };
}

export async function addStudentAction(
  classroomId: string,
  _prev: ClassroomFormState,
  formData: FormData,
): Promise<ClassroomFormState> {
  await requireTeacher();
  const displayName = String(formData.get("displayName") ?? "").trim();
  if (!displayName) {
    return { error: "Nhập display name của học sinh." };
  }
  try {
    await backendFetch<ClassroomMember>(`/api/v1/classrooms/${classroomId}/members`, {
      method: "POST",
      body: JSON.stringify({ displayName }),
    });
  } catch (error) {
    return { error: errorMessage(error, "Không thêm được học sinh") };
  }
  revalidatePath(`/classrooms/${classroomId}`);
  return { message: `Đã thêm ${displayName}.` };
}

export async function removeStudentAction(classroomId: string, studentId: string): Promise<void> {
  await requireTeacher();
  await backendFetch<void>(`/api/v1/classrooms/${classroomId}/members/${studentId}`, {
    method: "DELETE",
  });
  revalidatePath(`/classrooms/${classroomId}`);
}

export async function sharePapersAction(
  classroomId: string,
  _prev: ClassroomFormState,
  formData: FormData,
): Promise<ClassroomFormState> {
  await requireTeacher();
  const paperIds = formData.getAll("paperId").map(String).filter(Boolean);
  const paperSetIds = formData.getAll("paperSetId").map(String).filter(Boolean);
  if (paperIds.length === 0 && paperSetIds.length === 0) {
    return { error: "Chọn ít nhất một đề hoặc một bộ đề." };
  }
  let shared: { shared: number };
  try {
    shared = await backendFetch<{ shared: number }>(`/api/v1/classrooms/${classroomId}/papers`, {
      method: "POST",
      body: JSON.stringify({ paperIds, paperSetIds }),
    });
  } catch (error) {
    return { error: errorMessage(error, "Không đưa bài vào lớp được") };
  }
  revalidatePath(`/classrooms/${classroomId}`);
  revalidatePath("/papers");
  revalidatePath("/subjects");
  if (shared.shared === 0) {
    return { message: "Những mục đã chọn đã có trong lớp." };
  }
  return { message: `Đã đưa ${shared.shared} đề vào lớp. Học sinh trong lớp mới xem được.` };
}

export async function removePaperAction(classroomId: string, paperId: string): Promise<void> {
  await requireTeacher();
  await backendFetch<void>(`/api/v1/classrooms/${classroomId}/papers/${paperId}`, {
    method: "DELETE",
  });
  revalidatePath(`/classrooms/${classroomId}`);
  revalidatePath("/papers");
  revalidatePath("/subjects");
}
