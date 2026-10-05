"use client";

import {
  fetchAdminStudentDetails,
  toggleUserStatusAction,
  updateStudentEloAction,
} from "@/lib/admin-actions";
import type { AdminStudent, AdminStudentDetail, RankCode } from "@/lib/types";
import { useState, useTransition } from "react";

const rankColors: Record<RankCode, { bg: string; text: string; border: string }> = {
  BRONZE: { bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-300" },
  SILVER: { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-300" },
  GOLD: { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-300" },
  PLATINUM: { bg: "bg-cyan-100", text: "text-cyan-800", border: "border-cyan-300" },
  DIAMOND: { bg: "bg-indigo-100", text: "text-indigo-800", border: "border-indigo-300" },
};

export function AdminStudentsTable({ initialStudents }: { initialStudents: AdminStudent[] }) {
  const [students, setStudents] = useState<AdminStudent[]>(initialStudents);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRank, setSelectedRank] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editingElo, setEditingElo] = useState<number>(1000);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  // Student Detail Modal state
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<AdminStudent | null>(null);
  const [studentDetail, setStudentDetail] = useState<AdminStudentDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailTab, setDetailTab] = useState<"attempts" | "elo">("attempts");

  const handleOpenDetail = async (student: AdminStudent) => {
    setSelectedStudentForDetail(student);
    setLoadingDetail(true);
    setDetailTab("attempts");
    try {
      const data = await fetchAdminStudentDetails(student.id);
      setStudentDetail(data);
    } catch {
      // Fallback
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseDetail = () => {
    setSelectedStudentForDetail(null);
    setStudentDetail(null);
  };

  const filteredStudents = students.filter((s) => {
    const matchQuery =
      s.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRank = selectedRank === "ALL" || s.rankCode === selectedRank;
    const matchStatus =
      selectedStatus === "ALL" ||
      (selectedStatus === "ACTIVE" && s.enabled) ||
      (selectedStatus === "DISABLED" && !s.enabled);
    return matchQuery && matchRank && matchStatus;
  });

  const handleToggleStatus = (student: AdminStudent) => {
    const nextStatus = !student.enabled;
    startTransition(async () => {
      const res = await toggleUserStatusAction(student.id, nextStatus);
      if (res.success) {
        setStudents((prev) =>
          prev.map((item) => (item.id === student.id ? { ...item, enabled: nextStatus } : item))
        );
        setMessage(`Đã ${nextStatus ? "kích hoạt" : "khóa"} tài khoản ${student.displayName}`);
        setTimeout(() => setMessage(null), 3000);
      } else {
        alert(res.error || "Không thể thay đổi trạng thái");
      }
    });
  };

  const handleSaveElo = (studentId: string) => {
    startTransition(async () => {
      const res = await updateStudentEloAction(studentId, editingElo);
      if (res.success) {
        setStudents((prev) =>
          prev.map((item) => (item.id === studentId ? { ...item, eloRating: editingElo } : item))
        );
        setEditingStudentId(null);
        setMessage("Cập nhật Elo thành công!");
        setTimeout(() => setMessage(null), 3000);
      } else {
        alert(res.error || "Không thể cập nhật Elo");
      }
    });
  };

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
            placeholder="Tìm theo tên hoặc email học sinh..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-line bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedRank}
            onChange={(e) => setSelectedRank(e.target.value)}
            className="rounded-lg border border-line bg-background px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
          >
            <option value="ALL">Tất cả Rank</option>
            <option value="BRONZE">Đồng (Bronze)</option>
            <option value="SILVER">Bạc (Silver)</option>
            <option value="GOLD">Vàng (Gold)</option>
            <option value="PLATINUM">Bạch kim (Platinum)</option>
            <option value="DIAMOND">Kim cương (Diamond)</option>
          </select>

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
              <th className="px-4 py-3">Học sinh</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3 text-center">Elo / Rank</th>
              <th className="px-4 py-3 text-center">Lượt làm bài</th>
              <th className="px-4 py-3 text-center">Trạng thái</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted">
                  Không tìm thấy học sinh nào phù hợp với bộ lọc.
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => {
                const rankStyle = rankColors[student.rankCode] || {
                  bg: "bg-slate-100",
                  text: "text-slate-700",
                  border: "border-slate-300",
                };
                return (
                  <tr key={student.id} className="hover:bg-black/[0.02] transition-colors">
                    <td className="px-4 py-3.5 font-medium text-foreground">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/15 text-accent font-semibold text-xs">
                          {student.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{student.displayName}</div>
                          <div className="text-[11px] text-muted">
                            Tham gia: {new Date(student.createdAt).toLocaleDateString("vi-VN")}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-muted">{student.email}</td>
                    <td className="px-4 py-3.5 text-center">
                      {editingStudentId === student.id ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <input
                            type="number"
                            min={0}
                            max={4000}
                            value={editingElo}
                            onChange={(e) => setEditingElo(Number(e.target.value))}
                            className="w-20 rounded border border-line px-2 py-1 text-xs text-foreground focus:border-accent"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveElo(student.id)}
                            disabled={isPending}
                            className="rounded bg-accent px-2 py-1 text-xs text-white hover:bg-accent-hover"
                          >
                            Lưu
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingStudentId(null)}
                            className="rounded border border-line px-2 py-1 text-xs text-muted hover:bg-background"
                          >
                            Hủy
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${rankStyle.bg} ${rankStyle.text} ${rankStyle.border}`}
                          >
                            {student.rankCode}
                          </span>
                          <span className="font-mono text-xs font-bold text-foreground">
                            {student.eloRating}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center font-medium text-foreground">
                      <span className="inline-flex items-center rounded-md bg-background px-2.5 py-1 text-xs border border-line">
                        {student.totalAttempts} bài
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          student.enabled
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {student.enabled ? "Hoạt động" : "Đã khóa"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(student)}
                          className="rounded-lg border border-accent/30 bg-accent/5 px-2.5 py-1 text-xs font-semibold text-accent hover:bg-accent hover:text-white transition-all"
                        >
                          Xem chi tiết
                        </button>
                        {editingStudentId !== student.id && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingStudentId(student.id);
                              setEditingElo(student.eloRating);
                            }}
                            className="rounded-lg border border-line bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:border-accent hover:text-accent transition-colors"
                          >
                            Sửa Elo
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(student)}
                          disabled={isPending}
                          className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                            student.enabled
                              ? "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                              : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          }`}
                        >
                          {student.enabled ? "Khóa" : "Mở khóa"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Student Detail Modal */}
      {selectedStudentForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-line bg-card shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-line bg-muted/10 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-white font-bold text-lg shadow-sm">
                  {selectedStudentForDetail.displayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-foreground">
                      {selectedStudentForDetail.displayName}
                    </h3>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                        selectedStudentForDetail.enabled
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedStudentForDetail.enabled ? "Hoạt động" : "Đã khóa"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted mt-0.5">
                    <span>{selectedStudentForDetail.email}</span>
                    <span>•</span>
                    <span>
                      Tham gia:{" "}
                      {new Date(selectedStudentForDetail.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-foreground">
                      Rank: {selectedStudentForDetail.rankCode} ({selectedStudentForDetail.eloRating} Elo)
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseDetail}
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
                onClick={() => setDetailTab("attempts")}
                className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-all ${
                  detailTab === "attempts"
                    ? "border-accent text-accent"
                    : "border-transparent text-muted hover:text-foreground"
                }`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Lịch sử các bài đã thi ({studentDetail?.attempts?.length ?? selectedStudentForDetail.totalAttempts})
              </button>

              <button
                type="button"
                onClick={() => setDetailTab("elo")}
                className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-all ${
                  detailTab === "elo"
                    ? "border-accent text-accent"
                    : "border-transparent text-muted hover:text-foreground"
                }`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Lịch sử +/- Elo ({studentDetail?.eloHistory?.length ?? 0})
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {loadingDetail ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                  <p className="mt-3 text-sm">Đang tải dữ liệu chi tiết của học sinh...</p>
                </div>
              ) : (
                <>
                  {/* Tab 1: Exam attempts history */}
                  {detailTab === "attempts" && (
                    <div className="space-y-3">
                      {(!studentDetail?.attempts || studentDetail.attempts.length === 0) ? (
                        <div className="rounded-xl border border-line bg-muted/5 p-8 text-center text-muted">
                          <p className="font-medium text-foreground">Học sinh chưa tham gia bài thi nào.</p>
                          <p className="text-xs mt-1">Các bài thi luyện tập hoặc kiểm tra sẽ xuất hiện tại đây khi học sinh hoàn thành.</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto rounded-xl border border-line">
                          <table className="w-full text-left text-xs">
                            <thead className="border-b border-line bg-muted/10 font-semibold text-muted uppercase">
                              <tr>
                                <th className="px-3.5 py-2.5">Tên Đề thi</th>
                                <th className="px-3.5 py-2.5">Môn</th>
                                <th className="px-3.5 py-2.5 text-center">Điểm số</th>
                                <th className="px-3.5 py-2.5 text-center">Biến động Elo</th>
                                <th className="px-3.5 py-2.5 text-center">Trạng thái</th>
                                <th className="px-3.5 py-2.5 text-right">Thời gian thi</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-line">
                              {studentDetail.attempts.map((attempt) => (
                                <tr key={attempt.id} className="hover:bg-muted/5">
                                  <td className="px-3.5 py-2.5 font-medium text-foreground">
                                    {attempt.paperTitle}
                                  </td>
                                  <td className="px-3.5 py-2.5">
                                    <span className="inline-flex rounded bg-accent/10 px-2 py-0.5 font-medium text-accent">
                                      {attempt.subjectName}
                                    </span>
                                  </td>
                                  <td className="px-3.5 py-2.5 text-center font-bold text-foreground">
                                    {attempt.score !== null && attempt.score !== undefined
                                      ? `${attempt.score} / ${attempt.maxScore ?? 10}`
                                      : "—"}
                                  </td>
                                  <td className="px-3.5 py-2.5 text-center">
                                    {attempt.eloDelta !== null && attempt.eloDelta !== undefined ? (
                                      <span
                                        className={`inline-flex items-center font-mono font-bold ${
                                          attempt.eloDelta > 0
                                            ? "text-emerald-600"
                                            : attempt.eloDelta < 0
                                            ? "text-red-600"
                                            : "text-muted"
                                        }`}
                                      >
                                        {attempt.eloDelta > 0 ? `+${attempt.eloDelta}` : attempt.eloDelta}
                                        {attempt.eloBefore !== null && attempt.eloAfter !== null && (
                                          <span className="text-[10px] text-muted font-normal ml-1">
                                            ({attempt.eloBefore} → {attempt.eloAfter})
                                          </span>
                                        )}
                                      </span>
                                    ) : (
                                      <span className="text-muted">—</span>
                                    )}
                                  </td>
                                  <td className="px-3.5 py-2.5 text-center">
                                    <span
                                      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                        attempt.status === "GRADED"
                                          ? "bg-emerald-100 text-emerald-800"
                                          : attempt.status === "SUBMITTED"
                                          ? "bg-blue-100 text-blue-800"
                                          : "bg-amber-100 text-amber-800"
                                      }`}
                                    >
                                      {attempt.status === "GRADED"
                                        ? "Đã chấm điểm"
                                        : attempt.status === "SUBMITTED"
                                        ? "Đã nộp bài"
                                        : "Đang làm"}
                                    </span>
                                  </td>
                                  <td className="px-3.5 py-2.5 text-right text-muted">
                                    {new Date(attempt.startedAt).toLocaleString("vi-VN")}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab 2: Elo +/- History */}
                  {detailTab === "elo" && (
                    <div className="space-y-3">
                      {(!studentDetail?.eloHistory || studentDetail.eloHistory.length === 0) ? (
                        <div className="rounded-xl border border-line bg-muted/5 p-8 text-center text-muted">
                          <p className="font-medium text-foreground">Chưa có lịch sử biến động Elo.</p>
                          <p className="text-xs mt-1">Khi học sinh làm bài thi hoặc được cập nhật Elo, lịch sử sẽ ghi nhận tại đây.</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto rounded-xl border border-line">
                          <table className="w-full text-left text-xs">
                            <thead className="border-b border-line bg-muted/10 font-semibold text-muted uppercase">
                              <tr>
                                <th className="px-3.5 py-2.5">Thời gian</th>
                                <th className="px-3.5 py-2.5 text-center">Elo trước</th>
                                <th className="px-3.5 py-2.5 text-center">Thay đổi (+/-)</th>
                                <th className="px-3.5 py-2.5 text-center">Elo sau</th>
                                <th className="px-3.5 py-2.5">Lý do</th>
                                <th className="px-3.5 py-2.5">Bài thi liên quan</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-line">
                              {studentDetail.eloHistory.map((event) => (
                                <tr key={event.id} className="hover:bg-muted/5">
                                  <td className="px-3.5 py-2.5 text-muted">
                                    {new Date(event.createdAt).toLocaleString("vi-VN")}
                                  </td>
                                  <td className="px-3.5 py-2.5 text-center font-mono font-medium text-foreground">
                                    {event.ratingBefore}
                                  </td>
                                  <td className="px-3.5 py-2.5 text-center">
                                    <span
                                      className={`inline-flex items-center rounded px-2 py-0.5 font-mono font-bold ${
                                        event.delta > 0
                                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                          : event.delta < 0
                                          ? "bg-red-50 text-red-700 border border-red-200"
                                          : "bg-slate-50 text-slate-700 border border-slate-200"
                                      }`}
                                    >
                                      {event.delta > 0 ? `+${event.delta}` : event.delta}
                                    </span>
                                  </td>
                                  <td className="px-3.5 py-2.5 text-center font-mono font-bold text-foreground">
                                    {event.ratingAfter}
                                  </td>
                                  <td className="px-3.5 py-2.5 font-medium text-foreground">
                                    {event.reason === "ATTEMPT_GRADED"
                                      ? "Hoàn thành bài thi"
                                      : event.reason === "MANUAL"
                                      ? "Điều chỉnh thủ công"
                                      : event.reason === "AI_ADJUSTMENT"
                                      ? "AI tự động điều chỉnh"
                                      : event.reason === "PRACTICE"
                                      ? "Luyện tập tự do"
                                      : String(event.reason)}
                                  </td>
                                  <td className="px-3.5 py-2.5 text-muted">
                                    {event.paperTitle || "—"}
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
                onClick={handleCloseDetail}
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

