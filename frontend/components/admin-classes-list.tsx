"use client";

import { fetchAdminClassroomDetails } from "@/lib/admin-actions";
import type { AdminClassroom, AdminClassroomDetail } from "@/lib/types";
import Link from "next/link";
import { useEffect, useState } from "react";

export function AdminClassesList({
  initialClassrooms,
  initialSearchTerm = "",
}: {
  initialClassrooms: AdminClassroom[];
  initialSearchTerm?: string;
}) {
  const [classrooms] = useState<AdminClassroom[]>(initialClassrooms);
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);

  // Classroom Detail Modal state
  const [selectedClassForDetail, setSelectedClassForDetail] = useState<AdminClassroom | null>(null);
  const [classDetail, setClassDetail] = useState<AdminClassroomDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailTab, setDetailTab] = useState<"members" | "papers">("members");

  useEffect(() => {
    if (initialSearchTerm) {
      setSearchTerm(initialSearchTerm);
    }
  }, [initialSearchTerm]);

  const handleOpenClassDetail = async (cls: AdminClassroom) => {
    setSelectedClassForDetail(cls);
    setLoadingDetail(true);
    setDetailTab("members");
    try {
      const data = await fetchAdminClassroomDetails(cls.id);
      setClassDetail(data);
    } catch {
      // Fallback
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseClassDetail = () => {
    setSelectedClassForDetail(null);
    setClassDetail(null);
  };

  const filteredClassrooms = classrooms.filter((c) => {
    return (
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.teacherName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-line bg-gradient-to-r from-accent/10 via-card to-card p-5">
        <div>
          <h3 className="text-base font-semibold text-foreground">Quản lý Toàn bộ Lớp học</h3>
          <p className="text-xs text-muted mt-1">
            Theo dõi sĩ số học sinh, danh sách bài thi được giao và giáo viên quản lý lớp học.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/classrooms"
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-accent-hover transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tạo lớp học mới
          </Link>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-line bg-card p-4">
        <div className="relative flex-1 flex items-center gap-2">
          <input
            type="text"
            placeholder="Tìm theo tên lớp học hoặc giáo viên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-line bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="rounded-lg border border-line px-3 py-2 text-xs font-medium text-muted hover:text-foreground hover:bg-muted/10 transition-colors whitespace-nowrap"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-line bg-card shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-muted/5 text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3">Tên Lớp học</th>
              <th className="px-4 py-3">Giáo viên phụ trách</th>
              <th className="px-4 py-3 text-center">Sĩ số học sinh</th>
              <th className="px-4 py-3 text-center">Đề thi đã giao</th>
              <th className="px-4 py-3 text-center">Ngày tạo</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filteredClassrooms.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted">
                  Không tìm thấy lớp học nào phù hợp.
                </td>
              </tr>
            ) : (
              filteredClassrooms.map((cls) => (
                <tr key={cls.id} className="hover:bg-black/[0.02] transition-colors">
                  <td className="px-4 py-3.5 font-medium text-foreground">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 font-bold text-sm">
                        {cls.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground text-sm">{cls.name}</div>
                        <div className="text-[11px] text-muted">ID: {cls.id.slice(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-medium text-foreground">{cls.teacherName}</div>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
                      {cls.memberCount} học sinh
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
                      {cls.paperCount} đề thi
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center text-xs text-muted">
                    {new Date(cls.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenClassDetail(cls)}
                        className="inline-flex items-center gap-1 rounded-lg border border-line bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:border-accent hover:text-accent transition-colors"
                      >
                        Quản lý lớp
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Classroom Detail Modal */}
      {selectedClassForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-line bg-card shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-line bg-muted/10 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-lg shadow-sm">
                  {selectedClassForDetail.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    {selectedClassForDetail.name}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-muted mt-0.5">
                    <span>
                      Giáo viên: <strong className="text-foreground">{selectedClassForDetail.teacherName}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Ngày tạo: {new Date(selectedClassForDetail.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                    <span>•</span>
                    <span>ID: {selectedClassForDetail.id}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseClassDetail}
                className="rounded-lg p-2 text-muted hover:bg-muted/20 hover:text-foreground transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Sub-tabs header */}
            <div className="flex items-center gap-2 border-b border-line px-5 pt-3 bg-muted/5">
              <button
                type="button"
                onClick={() => setDetailTab("members")}
                className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-all ${
                  detailTab === "members"
                    ? "border-accent text-accent"
                    : "border-transparent text-muted hover:text-foreground"
                }`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Chi tiết số học sinh (Sĩ số: {classDetail?.members?.length ?? selectedClassForDetail.memberCount})
              </button>

              <button
                type="button"
                onClick={() => setDetailTab("papers")}
                className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-all ${
                  detailTab === "papers"
                    ? "border-accent text-accent"
                    : "border-transparent text-muted hover:text-foreground"
                }`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Chi tiết số đề thi (Đã giao: {classDetail?.papers?.length ?? selectedClassForDetail.paperCount})
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {loadingDetail ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                  <p className="mt-3 text-sm">Đang tải danh sách chi tiết của lớp học...</p>
                </div>
              ) : (
                <>
                  {/* Tab 1: Students detail */}
                  {detailTab === "members" && (
                    <div className="space-y-3">
                      {(!classDetail?.members || classDetail.members.length === 0) ? (
                        <div className="rounded-xl border border-line bg-muted/5 p-8 text-center text-muted">
                          <p className="font-medium text-foreground">Lớp học hiện chưa có học sinh nào tham gia.</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto rounded-xl border border-line">
                          <table className="w-full text-left text-xs">
                            <thead className="border-b border-line bg-muted/10 font-semibold text-muted uppercase">
                              <tr>
                                <th className="px-3.5 py-2.5">Tên Học sinh</th>
                                <th className="px-3.5 py-2.5">Email</th>
                                <th className="px-3.5 py-2.5 text-center">Elo / Rank</th>
                                <th className="px-3.5 py-2.5 text-right">Ngày tham gia lớp</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-line">
                              {classDetail.members.map((member) => (
                                <tr key={member.studentId} className="hover:bg-muted/5">
                                  <td className="px-3.5 py-2.5 font-medium text-foreground">
                                    <div className="flex items-center gap-2">
                                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/15 text-accent font-semibold text-[10px]">
                                        {member.displayName.charAt(0).toUpperCase()}
                                      </div>
                                      <span>{member.displayName}</span>
                                    </div>
                                  </td>
                                  <td className="px-3.5 py-2.5 text-muted">{member.email}</td>
                                  <td className="px-3.5 py-2.5 text-center">
                                    <span className="inline-flex items-center gap-1 font-mono font-semibold text-foreground">
                                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-700">
                                        {member.rankCode}
                                      </span>
                                      {member.eloRating}
                                    </span>
                                  </td>
                                  <td className="px-3.5 py-2.5 text-right text-muted">
                                    {new Date(member.joinedAt).toLocaleDateString("vi-VN")}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab 2: Papers detail */}
                  {detailTab === "papers" && (
                    <div className="space-y-3">
                      {(!classDetail?.papers || classDetail.papers.length === 0) ? (
                        <div className="rounded-xl border border-line bg-muted/5 p-8 text-center text-muted">
                          <p className="font-medium text-foreground">Chưa có đề thi nào được giao cho lớp này.</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto rounded-xl border border-line">
                          <table className="w-full text-left text-xs">
                            <thead className="border-b border-line bg-muted/10 font-semibold text-muted uppercase">
                              <tr>
                                <th className="px-3.5 py-2.5">Tiêu đề đề thi</th>
                                <th className="px-3.5 py-2.5">Môn học</th>
                                <th className="px-3.5 py-2.5 text-center">Thời lượng</th>
                                <th className="px-3.5 py-2.5 text-center">Số câu hỏi</th>
                                <th className="px-3.5 py-2.5 text-center">Trạng thái</th>
                                <th className="px-3.5 py-2.5 text-right">Ngày giao</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-line">
                              {classDetail.papers.map((paper) => (
                                <tr key={paper.paperId} className="hover:bg-muted/5">
                                  <td className="px-3.5 py-2.5 font-medium text-foreground">
                                    {paper.title}
                                  </td>
                                  <td className="px-3.5 py-2.5">
                                    <span className="inline-flex rounded bg-accent/10 px-2 py-0.5 font-medium text-accent">
                                      {paper.subjectName}
                                    </span>
                                  </td>
                                  <td className="px-3.5 py-2.5 text-center text-muted">
                                    {paper.durationMinutes} phút
                                  </td>
                                  <td className="px-3.5 py-2.5 text-center font-medium text-foreground">
                                    {paper.questionCount} câu
                                  </td>
                                  <td className="px-3.5 py-2.5 text-center">
                                    <span
                                      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                        paper.status === "PUBLISHED"
                                          ? "bg-emerald-100 text-emerald-800"
                                          : "bg-slate-100 text-slate-700"
                                      }`}
                                    >
                                      {paper.status === "PUBLISHED" ? "Đã công bố" : paper.status}
                                    </span>
                                  </td>
                                  <td className="px-3.5 py-2.5 text-right text-muted">
                                    {new Date(paper.assignedAt).toLocaleDateString("vi-VN")}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end border-t border-line bg-muted/5 p-4">
              <button
                type="button"
                onClick={handleCloseClassDetail}
                className="rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-accent-hover transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

