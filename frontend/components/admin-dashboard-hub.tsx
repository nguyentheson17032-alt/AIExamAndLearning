"use client";

import { AdminAiExamsList } from "@/components/admin-ai-exams-list";
import { AdminClassesList } from "@/components/admin-classes-list";
import { AdminStudentsTable } from "@/components/admin-students-table";
import { AdminTeachersTable } from "@/components/admin-teachers-table";
import type {
  AdminAiExam,
  AdminClassroom,
  AdminStats,
  AdminStudent,
  AdminTeacher,
} from "@/lib/types";
import Link from "next/link";
import { useState } from "react";

type TabKey = "overview" | "students" | "teachers" | "ai-exams" | "classes";

export function AdminDashboardHub({
  stats,
  students,
  teachers,
  aiExams,
  classrooms,
}: {
  stats: AdminStats;
  students: AdminStudent[];
  teachers: AdminTeacher[];
  aiExams: AdminAiExam[];
  classrooms: AdminClassroom[];
}) {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [classSearchTerm, setClassSearchTerm] = useState<string>("");

  const handleViewTeacherClasses = (teacherName: string) => {
    setClassSearchTerm(teacherName);
    setActiveTab("classes");
  };

  const totalStudents = stats.totalStudents || students.length || 0;
  const rankDist = stats.rankDistribution || {};

  const ranks = [
    { code: "BRONZE", name: "Đồng (Bronze)", count: rankDist.BRONZE || 0, color: "bg-amber-600", barColor: "bg-amber-500", text: "text-amber-700" },
    { code: "SILVER", name: "Bạc (Silver)", count: rankDist.SILVER || 0, color: "bg-slate-500", barColor: "bg-slate-400", text: "text-slate-600" },
    { code: "GOLD", name: "Vàng (Gold)", count: rankDist.GOLD || 0, color: "bg-yellow-500", barColor: "bg-yellow-400", text: "text-yellow-700" },
    { code: "PLATINUM", name: "Bạch kim (Platinum)", count: rankDist.PLATINUM || 0, color: "bg-cyan-500", barColor: "bg-cyan-400", text: "text-cyan-700" },
    { code: "DIAMOND", name: "Kim cương (Diamond)", count: rankDist.DIAMOND || 0, color: "bg-indigo-600", barColor: "bg-indigo-500", text: "text-indigo-700" },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start relative">
      {/* Interactive Tabs Sidebar (Left Navigation - Sticky on scroll) */}
      <aside className="w-full lg:w-64 shrink-0 lg:sticky lg:top-6 z-30 self-start">
        <div className="rounded-2xl border border-line bg-card p-2 sm:p-3 shadow-md space-y-3 max-h-[calc(100vh-3rem)] overflow-y-auto backdrop-blur-xs">
          <div className="hidden lg:block px-3 pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
            Menu Quản Trị
          </div>

          <nav className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`flex items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all text-left whitespace-nowrap lg:whitespace-normal ${
                activeTab === "overview"
                  ? "bg-accent text-white shadow-sm font-semibold"
                  : "text-foreground/80 hover:bg-line/50 hover:text-foreground border border-transparent"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span>Tổng quan Dashboard</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("students")}
              className={`flex items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all text-left whitespace-nowrap lg:whitespace-normal ${
                activeTab === "students"
                  ? "bg-accent text-white shadow-sm font-semibold"
                  : "text-foreground/80 hover:bg-line/50 hover:text-foreground border border-transparent"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>Học sinh</span>
              </div>
              <span
                className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                  activeTab === "students"
                    ? "bg-white/20 text-white"
                    : "bg-line text-muted"
                }`}
              >
                {students.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("teachers")}
              className={`flex items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all text-left whitespace-nowrap lg:whitespace-normal ${
                activeTab === "teachers"
                  ? "bg-accent text-white shadow-sm font-semibold"
                  : "text-foreground/80 hover:bg-line/50 hover:text-foreground border border-transparent"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>Giáo viên</span>
              </div>
              <span
                className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                  activeTab === "teachers"
                    ? "bg-white/20 text-white"
                    : "bg-line text-muted"
                }`}
              >
                {teachers.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("ai-exams")}
              className={`flex items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all text-left whitespace-nowrap lg:whitespace-normal ${
                activeTab === "ai-exams"
                  ? "bg-accent text-white shadow-sm font-semibold"
                  : "text-foreground/80 hover:bg-line/50 hover:text-foreground border border-transparent"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span>Bộ đề AI</span>
              </div>
              <span
                className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                  activeTab === "ai-exams"
                    ? "bg-white/20 text-white"
                    : "bg-line text-muted"
                }`}
              >
                {aiExams.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("classes")}
              className={`flex items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all text-left whitespace-nowrap lg:whitespace-normal ${
                activeTab === "classes"
                  ? "bg-accent text-white shadow-sm font-semibold"
                  : "text-foreground/80 hover:bg-line/50 hover:text-foreground border border-transparent"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                </svg>
                <span>Lớp học</span>
              </div>
              <span
                className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                  activeTab === "classes"
                    ? "bg-white/20 text-white"
                    : "bg-line text-muted"
                }`}
              >
                {classrooms.length}
              </span>
            </button>
          </nav>

          <div className="hidden lg:block pt-3 border-t border-line text-xs text-muted space-y-1.5 px-1">
            <div className="flex items-center justify-between">
              <span>Trạng thái:</span>
              <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Trực tuyến
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Đề AI tạo:</span>
              <span className="font-semibold text-foreground">{stats.totalAiExams}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 min-w-0 w-full">

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Executive KPI Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              onClick={() => setActiveTab("students")}
              className="cursor-pointer group rounded-xl border border-line bg-card p-4 shadow-sm hover:border-accent/60 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted">Tổng Học sinh</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 group-hover:scale-105 transition-transform">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <div className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                {stats.totalStudents}
              </div>
              <div className="mt-1 text-[11px] text-muted flex items-center gap-1 group-hover:text-accent">
                <span>Xem danh sách học sinh</span>
                <span>→</span>
              </div>
            </div>

            <div
              onClick={() => setActiveTab("teachers")}
              className="cursor-pointer group rounded-xl border border-line bg-card p-4 shadow-sm hover:border-accent/60 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted">Tổng Giáo viên</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 group-hover:scale-105 transition-transform">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <div className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                {stats.totalTeachers}
              </div>
              <div className="mt-1 text-[11px] text-muted flex items-center gap-1 group-hover:text-accent">
                <span>Xem danh sách giáo viên</span>
                <span>→</span>
              </div>
            </div>

            <div
              onClick={() => setActiveTab("ai-exams")}
              className="cursor-pointer group rounded-xl border border-line bg-card p-4 shadow-sm hover:border-accent/60 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted">Bộ đề AI sinh ra</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 group-hover:scale-105 transition-transform">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              </div>
              <div className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                {stats.totalAiExams}
              </div>
              <div className="mt-1 text-[11px] text-muted flex items-center gap-1 group-hover:text-accent">
                <span>Xem kho đề AI</span>
                <span>→</span>
              </div>
            </div>

            <div
              onClick={() => setActiveTab("classes")}
              className="cursor-pointer group rounded-xl border border-line bg-card p-4 shadow-sm hover:border-accent/60 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted">Tổng Lớp học</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 group-hover:scale-105 transition-transform">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                  </svg>
                </div>
              </div>
              <div className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                {stats.totalClassrooms}
              </div>
              <div className="mt-1 text-[11px] text-muted flex items-center gap-1 group-hover:text-accent">
                <span>Quản lý lớp học</span>
                <span>→</span>
              </div>
            </div>
          </div>

          {/* Detailed Analytics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Elo & Rank distribution */}
            <div className="rounded-xl border border-line bg-card p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/15 text-accent">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-semibold text-foreground">Phân bố Xếp hạng Elo Học sinh</h3>
                </div>
                <span className="text-xs text-muted">Tổng: {totalStudents} học sinh</span>
              </div>

              <div className="space-y-3">
                {ranks.map((r) => {
                  const pct = totalStudents > 0 ? Math.round((r.count / totalStudents) * 100) : 0;
                  return (
                    <div key={r.code} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-foreground">{r.name}</span>
                        <span className="font-semibold text-muted">
                          {r.count} học sinh ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-line/60 overflow-hidden">
                        <div
                          className={`h-full ${r.barColor} transition-all duration-500`}
                          style={{ width: `${Math.max(pct, r.count > 0 ? 5 : 0)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-line flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveTab("students")}
                  className="text-xs font-semibold text-accent hover:underline"
                >
                  Điều chỉnh Elo học sinh →
                </button>
              </div>
            </div>

            {/* System Summary & Activity */}
            <div className="rounded-xl border border-line bg-card p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/15 text-blue-600">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-foreground">Chỉ số Hoạt động Hệ thống</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-background p-3.5 border border-line">
                  <div className="text-xs text-muted">Tổng số câu hỏi</div>
                  <div className="text-xl font-bold text-foreground mt-1">{stats.totalQuestions}</div>
                  <div className="text-[11px] text-muted mt-0.5">Trong ngân hàng đề</div>
                </div>

                <div className="rounded-lg bg-background p-3.5 border border-line">
                  <div className="text-xs text-muted">Lượt làm bài thi</div>
                  <div className="text-xl font-bold text-foreground mt-1">{stats.totalAttempts}</div>
                  <div className="text-[11px] text-muted mt-0.5">Đã nộp và chấm điểm</div>
                </div>

                <div className="rounded-lg bg-background p-3.5 border border-line">
                  <div className="text-xs text-muted">Bộ đề toàn hệ thống</div>
                  <div className="text-xl font-bold text-foreground mt-1">{stats.totalPapers}</div>
                  <div className="text-[11px] text-muted mt-0.5">Đề thi & luyện tập</div>
                </div>

                <div className="rounded-lg bg-background p-3.5 border border-line">
                  <div className="text-xs text-muted">Lớp học hoạt động</div>
                  <div className="text-xl font-bold text-foreground mt-1">{stats.totalClassrooms}</div>
                  <div className="text-[11px] text-muted mt-0.5">Đang giảng dạy</div>
                </div>
              </div>

              <div className="pt-2 border-t border-line flex items-center justify-between">
                <span className="text-xs text-muted">AI Tutor Engine: <strong>Sẵn sàng</strong></span>
                <Link
                  href="/ai-tutor"
                  className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent-hover transition-colors"
                >
                  Sinh đề AI ngay
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Preview Tables */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground">Học sinh mới nhất</h3>
              <button
                type="button"
                onClick={() => setActiveTab("students")}
                className="text-xs font-semibold text-accent hover:underline"
              >
                Xem tất cả ({students.length}) →
              </button>
            </div>
            <AdminStudentsTable initialStudents={students.slice(0, 5)} />
          </div>
        </div>
      )}

      {/* Tab 2: Students */}
      {activeTab === "students" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-foreground">Quản lý Học sinh</h2>
            <span className="text-xs text-muted">Tổng cộng {students.length} tài khoản</span>
          </div>
          <AdminStudentsTable initialStudents={students} />
        </div>
      )}

      {/* Tab 3: Teachers */}
      {activeTab === "teachers" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-foreground">Quản lý Giáo viên</h2>
            <span className="text-xs text-muted">Tổng cộng {teachers.length} tài khoản</span>
          </div>
          <AdminTeachersTable
            initialTeachers={teachers}
            classrooms={classrooms}
            onViewTeacherClasses={handleViewTeacherClasses}
          />
        </div>
      )}

      {/* Tab 4: AI Exams */}
      {activeTab === "ai-exams" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-foreground">Quản lý Bộ đề AI sinh ra</h2>
            <span className="text-xs text-muted">Tổng cộng {aiExams.length} bộ đề</span>
          </div>
          <AdminAiExamsList initialExams={aiExams} />
        </div>
      )}

      {/* Tab 5: Classes */}
      {activeTab === "classes" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-foreground">Quản lý Lớp học</h2>
            <span className="text-xs text-muted">Tổng cộng {classrooms.length} lớp học</span>
          </div>
          <AdminClassesList
            initialClassrooms={classrooms}
            initialSearchTerm={classSearchTerm}
          />
        </div>
      )}
      </div>
    </div>
  );
}

