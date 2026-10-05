"use client";

import { toggleUserStatusAction } from "@/lib/admin-actions";
import type { AdminClassroom, AdminTeacher } from "@/lib/types";
import Link from "next/link";
import { useState, useTransition } from "react";

export function AdminTeachersTable({
  initialTeachers,
  classrooms = [],
  onViewTeacherClasses,
}: {
  initialTeachers: AdminTeacher[];
  classrooms?: AdminClassroom[];
  onViewTeacherClasses?: (teacherName: string) => void;
}) {
  const [teachers, setTeachers] = useState<AdminTeacher[]>(initialTeachers);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [selectedTeacherForModal, setSelectedTeacherForModal] = useState<AdminTeacher | null>(null);

  const filteredTeachers = teachers.filter((t) => {
    const matchQuery =
      t.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus =
      selectedStatus === "ALL" ||
      (selectedStatus === "ACTIVE" && t.enabled) ||
      (selectedStatus === "DISABLED" && !t.enabled);
    return matchQuery && matchStatus;
  });

  const handleToggleStatus = (teacher: AdminTeacher) => {
    const nextStatus = !teacher.enabled;
    startTransition(async () => {
      const res = await toggleUserStatusAction(teacher.id, nextStatus);
      if (res.success) {
        setTeachers((prev) =>
          prev.map((item) => (item.id === teacher.id ? { ...item, enabled: nextStatus } : item))
        );
        setMessage(`Đã ${nextStatus ? "kích hoạt" : "khóa"} tài khoản ${teacher.displayName}`);
        setTimeout(() => setMessage(null), 3000);
      } else {
        alert(res.error || "Không thể thay đổi trạng thái");
      }
    });
  };

  const teacherClassrooms = selectedTeacherForModal
    ? classrooms.filter(
        (c) =>
          c.teacherId === selectedTeacherForModal.id ||
          c.teacherName.toLowerCase() === selectedTeacherForModal.displayName.toLowerCase()
      )
    : [];

  return (
    <div className="space-y-4">
      {message && (
        <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm text-emerald-800 transition-all">
          ✓ {message}
        </div>
      )}

      {/* Filter and Search toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-line bg-card p-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Tìm theo tên hoặc email giáo viên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-line bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-lg border border-line bg-background px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
          >
            <option value="ALL">Tất cả Trạng thái</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="DISABLED">Đang bị khóa</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-line bg-card shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-muted/5 text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3">Giáo viên</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3 text-center">Số lớp phụ trách</th>
              <th className="px-4 py-3 text-center">Đề thi đã soạn</th>
              <th className="px-4 py-3 text-center">Trạng thái</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filteredTeachers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted">
                  Không tìm thấy giáo viên nào phù hợp với bộ lọc.
                </td>
              </tr>
            ) : (
              filteredTeachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-black/[0.02] transition-colors">
                  <td className="px-4 py-3.5 font-medium text-foreground">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-800 font-semibold text-xs">
                        {teacher.displayName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{teacher.displayName}</div>
                        <div className="text-[11px] text-muted">
                          Tham gia: {new Date(teacher.createdAt).toLocaleDateString("vi-VN")}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-muted">{teacher.email}</td>
                  <td className="px-4 py-3.5 text-center">
                    <button
                      type="button"
                      onClick={() => setSelectedTeacherForModal(teacher)}
                      title="Xem danh sách lớp"
                      className="inline-flex items-center rounded-md bg-background px-2.5 py-1 text-xs border border-line font-medium text-foreground hover:border-accent hover:text-accent transition-colors"
                    >
                      {teacher.classroomsCount} lớp
                    </button>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="inline-flex items-center rounded-md bg-background px-2.5 py-1 text-xs border border-line font-medium text-foreground">
                      {teacher.papersCount} bộ đề
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        teacher.enabled
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {teacher.enabled ? "Hoạt động" : "Đã khóa"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedTeacherForModal(teacher)}
                        className="rounded-lg border border-line bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:border-accent hover:text-accent hover:bg-accent/5 transition-colors"
                      >
                        Xem các lớp
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleStatus(teacher)}
                        disabled={isPending}
                        className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                          teacher.enabled
                            ? "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                            : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        }`}
                      >
                        {teacher.enabled ? "Khóa" : "Mở khóa"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Teacher Classrooms Modal */}
      {selectedTeacherForModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150"
          onClick={() => setSelectedTeacherForModal(null)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl border border-line bg-card p-6 shadow-xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-line pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent font-bold text-base">
                  {selectedTeacherForModal.displayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Danh sách Lớp học của Giáo viên
                  </h3>
                  <p className="text-xs text-muted">
                    {selectedTeacherForModal.displayName} ({selectedTeacherForModal.email})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTeacherForModal(null)}
                className="rounded-lg p-1.5 text-muted hover:bg-muted/10 hover:text-foreground transition-colors"
                aria-label="Đóng"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body: Classroom List */}
            <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-1">
              {teacherClassrooms.length === 0 ? (
                <div className="rounded-xl border border-dashed border-line p-8 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted/10 text-muted mb-2">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-foreground">Chưa có lớp học nào</p>
                  <p className="text-xs text-muted mt-1">
                    Giáo viên này hiện tại chưa khởi tạo lớp học nào trên hệ thống.
                  </p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {teacherClassrooms.map((cls) => (
                    <div
                      key={cls.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-line bg-background p-4 hover:border-accent/50 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground text-sm">{cls.name}</span>
                          <span className="text-[11px] text-muted bg-muted/10 px-2 py-0.5 rounded font-mono">
                            ID: {cls.id.slice(0, 8)}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
                          <span className="flex items-center gap-1">
                            <span className="font-medium text-foreground">{cls.memberCount}</span> học sinh
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <span className="font-medium text-foreground">{cls.paperCount}</span> đề thi đã giao
                          </span>
                          <span>•</span>
                          <span>Tạo ngày {new Date(cls.createdAt).toLocaleDateString("vi-VN")}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Link
                          href={`/classrooms/${cls.id}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-line bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:border-accent hover:text-accent transition-colors"
                        >
                          Xem chi tiết
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-line pt-4">
              <span className="text-xs text-muted">
                Tổng cộng: {teacherClassrooms.length} lớp học
              </span>
              <div className="flex items-center gap-2">
                {onViewTeacherClasses && teacherClassrooms.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const teacherName = selectedTeacherForModal.displayName;
                      setSelectedTeacherForModal(null);
                      onViewTeacherClasses(teacherName);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent-hover transition-colors"
                  >
                    Xem trong tab Quản lý Lớp học →
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedTeacherForModal(null)}
                  className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/10 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
