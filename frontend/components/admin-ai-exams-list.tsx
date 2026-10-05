"use client";

import { togglePaperStatusAction } from "@/lib/admin-actions";
import type { AdminAiExam, ContentStatus } from "@/lib/types";
import Link from "next/link";
import { useState, useTransition } from "react";

export function AdminAiExamsList({ initialExams }: { initialExams: AdminAiExam[] }) {
  const [exams, setExams] = useState<AdminAiExam[]>(initialExams);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKind, setSelectedKind] = useState<string>("ALL");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const filteredExams = exams.filter((exam) => {
    const matchQuery =
      exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.subjectName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchKind = selectedKind === "ALL" || exam.kind === selectedKind;
    return matchQuery && matchKind;
  });

  const handleToggleLock = (exam: AdminAiExam) => {
    const isLocked = exam.status === "ARCHIVED";
    const nextStatus: ContentStatus = isLocked ? "PUBLISHED" : "ARCHIVED";

    startTransition(async () => {
      const res = await togglePaperStatusAction(exam.id, nextStatus);
      if (res.success) {
        setExams((prev) =>
          prev.map((item) => (item.id === exam.id ? { ...item, status: nextStatus } : item))
        );
        setMessage(`Đã ${isLocked ? "mở khóa" : "khóa"} đề thi "${exam.title}"`);
        setTimeout(() => setMessage(null), 3000);
      } else {
        alert(res.error || "Không thể thay đổi trạng thái đề thi");
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

      {/* Top Banner and Quick Generation Link */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-line bg-gradient-to-r from-accent/10 via-card to-card p-5">
        <div>
          <h3 className="text-base font-semibold text-foreground">Hệ thống Đề thi sinh tự động bằng AI</h3>
          <p className="text-xs text-muted mt-1">
            Quản lý các bộ đề thi Toán, Vật lý, đề luyện tập theo mức Elo và trắc nghiệm do AI tạo ra.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/ai-tutor"
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-accent-hover transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tạo đề AI mới
          </Link>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-line bg-card p-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Tìm theo tiêu đề đề thi hoặc môn học..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-line bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedKind}
            onChange={(e) => setSelectedKind(e.target.value)}
            className="rounded-lg border border-line bg-background px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
          >
            <option value="ALL">Tất cả loại bài</option>
            <option value="PRACTICE">Luyện tập (Practice)</option>
            <option value="EXAM">Thi chính thức (Exam)</option>
            <option value="ASSIGNMENT">Bài tập về nhà (Assignment)</option>
            <option value="PROMOTION">Thi thăng hạng (Promotion)</option>
          </select>
        </div>
      </div>

      {/* Grid of AI Exams */}
      {filteredExams.length === 0 ? (
        <div className="rounded-xl border border-line bg-card p-8 text-center text-muted">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <p className="font-medium text-foreground">Không tìm thấy bộ đề AI nào</p>
          <p className="text-xs mt-1">Hãy sinh thêm đề mới từ AI Tutor hoặc thay đổi bộ lọc tìm kiếm.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredExams.map((exam) => {
            const isLocked = exam.status === "ARCHIVED";
            return (
              <div
                key={exam.id}
                className="flex flex-col justify-between rounded-xl border border-line bg-card p-5 shadow-sm hover:border-accent/50 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center rounded-md bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent border border-accent/20">
                        {exam.subjectName}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-700">
                        {exam.kind}
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        isLocked
                          ? "bg-red-100 text-red-800 border border-red-200"
                          : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      }`}
                    >
                      {isLocked ? "Đã khóa" : "Đang mở"}
                    </span>
                  </div>

                  <h4 className="font-semibold text-foreground text-base leading-snug">
                    {exam.title}
                  </h4>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted">
                    <div className="flex items-center gap-1.5">
                      <svg className="h-4 w-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{exam.questionCount} câu hỏi</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <svg className="h-4 w-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{exam.durationMinutes} phút</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <svg className="h-4 w-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>Elo: {exam.targetEloMin} - {exam.targetEloMax}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <svg className="h-4 w-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{new Date(exam.createdAt).toLocaleDateString("vi-VN")}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-line flex items-center justify-between gap-2">
                  <span className="text-[11px] text-muted">
                    Tạo bởi: <strong className="text-foreground">{exam.authorName}</strong>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleLock(exam)}
                      disabled={isPending}
                      className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                        isLocked
                          ? "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          : "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                      }`}
                    >
                      {isLocked ? "Mở khóa" : "Khóa"}
                    </button>
                    <Link
                      href={`/papers/${exam.id}`}
                      className="rounded-lg border border-line bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:border-accent hover:text-accent transition-colors"
                    >
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

