import { AdminDashboardHub } from "@/components/admin-dashboard-hub";
import {
  fetchAdminAiExams,
  fetchAdminClassrooms,
  fetchAdminStats,
  fetchAdminStudents,
  fetchAdminTeachers,
} from "@/lib/admin-actions";
import { requireTeacher } from "@/lib/guards";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard · Exam Warehouse",
  description: "Bảng điều khiển quản trị trung tâm: Quản lý học sinh, giáo viên, đề thi AI và lớp học",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await requireTeacher();

  const [stats, students, teachers, aiExams, classrooms] = await Promise.all([
    fetchAdminStats(),
    fetchAdminStudents(),
    fetchAdminTeachers(),
    fetchAdminAiExams(),
    fetchAdminClassrooms(),
  ]);

  return (
    <AdminDashboardHub
      stats={stats}
      students={students}
      teachers={teachers}
      aiExams={aiExams}
      classrooms={classrooms}
    />
  );
}
