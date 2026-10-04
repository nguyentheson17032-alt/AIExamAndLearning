"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import type { PaperKind, PaperSet } from "@/lib/types";

type ClassPaperWithClass = {
  id: string;
  title: string;
  kind: PaperKind;
  durationMinutes: number;
  className: string;
  teacherName: string;
  subjectId?: string;
  examNumber?: number | null;
};

function foldText(val: string | null | undefined): string {
  if (!val) return "";
  return val
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/đ/gi, "d")
    .toLowerCase();
}

const KIND_LABELS: Record<string, string> = {
  EXAM: "Thi / Kiểm tra",
  ASSIGNMENT: "Bài tập về nhà",
  PRACTICE: "Luyện tập",
  PROMOTION: "Thi thăng hạng",
};

export function SubjectDetailFilter({
  subjectId,
  subjectName,
  isTeacher,
  sets,
  classPapers,
  hasNoClassrooms,
}: {
  subjectId: string;
  subjectName: string;
  isTeacher: boolean;
  sets: PaperSet[];
  classPapers: ClassPaperWithClass[];
  hasNoClassrooms: boolean;
}) {
  // Sets filtering state (for teacher)
  const [setSearchQuery, setSetSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>("ALL");

  // Class papers filtering state (for both teacher & student)
  const [paperSearchQuery, setPaperSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("ALL");
  const [selectedKind, setSelectedKind] = useState<string>("ALL");

  // Distinct academic years for sets
  const academicYears = useMemo(() => {
    const years = new Set<string>();
    sets.forEach((s) => {
      if (s.academicYear) years.add(s.academicYear);
    });
    return Array.from(years);
  }, [sets]);

  // Distinct classes for class papers
  const classNames = useMemo(() => {
    const names = new Set<string>();
    classPapers.forEach((p) => {
      if (p.className) names.add(p.className);
    });
    return Array.from(names);
  }, [classPapers]);

  // Filtered sets
  const filteredSets = useMemo(() => {
    return sets.filter((set) => {
      if (selectedYear !== "ALL" && set.academicYear !== selectedYear) {
        return false;
      }
      if (setSearchQuery.trim()) {
        const q = foldText(setSearchQuery);
        const title = foldText(set.title);
        const desc = foldText(set.description);
        const year = foldText(set.academicYear);
        if (!title.includes(q) && !desc.includes(q) && !year.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [sets, selectedYear, setSearchQuery]);

  // Filtered class papers
  const filteredPapers = useMemo(() => {
    return classPapers.filter((paper) => {
      if (selectedClass !== "ALL" && paper.className !== selectedClass) {
        return false;
      }
      if (selectedKind !== "ALL" && paper.kind !== selectedKind) {
        return false;
      }
      if (paperSearchQuery.trim()) {
        const q = foldText(paperSearchQuery);
        const title = foldText(paper.title);
        const cName = foldText(paper.className);
        const tName = foldText(paper.teacherName);
        if (!title.includes(q) && !cName.includes(q) && !tName.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [classPapers, selectedClass, selectedKind, paperSearchQuery]);

  return (
    <div className="space-y-8">
      {isTeacher ? (
        <>
          {/* TEACHER: Paper Sets Section */}
          <section>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
              <h2 className="font-semibold text-base text-foreground">
                📁 Bộ đề môn {subjectName} ({sets.length})
              </h2>

              {sets.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  {/* Year filter */}
                  {academicYears.length > 1 && (
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="rounded-lg border border-line bg-card px-2.5 py-1 text-xs text-foreground focus:border-accent focus:outline-hidden"
                    >
                      <option value="ALL">Tất cả năm học</option>
                      {academicYears.map((yr) => (
                        <option key={yr} value={yr}>
                          Năm học {yr}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Search sets */}
                  <div className="relative min-w-[180px]">
                    <input
                      type="text"
                      placeholder="Tìm bộ đề..."
                      value={setSearchQuery}
                      onChange={(e) => setSetSearchQuery(e.target.value)}
                      className="w-full rounded-lg border border-line bg-card py-1 pr-6 pl-7 text-xs text-foreground placeholder:text-muted focus:border-accent focus:outline-hidden"
                    />
                    <svg
                      className="pointer-events-none absolute top-1.5 left-2 h-3.5 w-3.5 text-muted"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    {setSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setSetSearchQuery("")}
                        className="absolute top-1 right-2 text-xs text-muted hover:text-foreground"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {sets.length === 0 ? (
              <EmptyState title="Chưa có bộ đề" description="Khi sinh đề AI hoặc tạo bộ đề, các bộ đề của môn này sẽ hiển thị tại đây." />
            ) : filteredSets.length === 0 ? (
              <div className="rounded-xl border border-dashed border-line bg-card/50 p-6 text-center text-xs text-muted">
                Không tìm thấy bộ đề phù hợp.
                <button
                  type="button"
                  onClick={() => {
                    setSelectedYear("ALL");
                    setSetSearchQuery("");
                  }}
                  className="ml-2 font-medium text-accent hover:underline"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2">
                {filteredSets.map((set) => (
                  <li key={set.id}>
                    <Link
                      href={`/subjects/${subjectId}/sets/${set.id}`}
                      className="block rounded-xl border border-line bg-card p-5 hover:border-accent hover:shadow-xs transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="rounded bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
                          {set.academicYear ?? "Năm học"}
                        </span>
                        <span className="text-xs text-muted font-medium">{set.paperCount} đề thi</span>
                      </div>
                      <h3 className="mt-2 font-medium text-foreground">{set.title}</h3>
                      {set.description ? <p className="mt-1 text-xs text-muted line-clamp-2">{set.description}</p> : null}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* TEACHER: Class Papers Section */}
          {classPapers.length > 0 && (
            <section>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
                <h2 className="font-semibold text-base text-foreground">
                  Bài trong lớp ({classPapers.length})
                </h2>

                <div className="flex flex-wrap items-center gap-2">
                  {classNames.length > 1 && (
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="rounded-lg border border-line bg-card px-2.5 py-1 text-xs text-foreground focus:border-accent focus:outline-hidden"
                    >
                      <option value="ALL">Tất cả lớp ({classPapers.length})</option>
                      {classNames.map((name) => (
                        <option key={name} value={name}>
                          Lớp {name}
                        </option>
                      ))}
                    </select>
                  )}

                  <div className="relative min-w-[180px]">
                    <input
                      type="text"
                      placeholder="Tìm bài trong lớp..."
                      value={paperSearchQuery}
                      onChange={(e) => setPaperSearchQuery(e.target.value)}
                      className="w-full rounded-lg border border-line bg-card py-1 pr-6 pl-7 text-xs text-foreground placeholder:text-muted focus:border-accent focus:outline-hidden"
                    />
                    <svg
                      className="pointer-events-none absolute top-1.5 left-2 h-3.5 w-3.5 text-muted"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    {paperSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setPaperSearchQuery("")}
                        className="absolute top-1 right-2 text-xs text-muted hover:text-foreground"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {filteredPapers.length === 0 ? (
                <div className="rounded-xl border border-dashed border-line bg-card/50 p-6 text-center text-xs text-muted">
                  Không tìm thấy bài phù hợp trong lớp.
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedClass("ALL");
                      setPaperSearchQuery("");
                    }}
                    className="ml-2 font-medium text-accent hover:underline"
                  >
                    Xóa bộ lọc
                  </button>
                </div>
              ) : (
                <ul className="space-y-3">
                  {filteredPapers.map((paper) => (
                    <li key={paper.id}>
                      <Link href={`/papers/${paper.id}`} className="block rounded-xl border border-line bg-card p-4 hover:border-accent transition">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-xs text-muted">
                            {KIND_LABELS[paper.kind] ?? paper.kind} · ⏱ {paper.durationMinutes} phút · Lớp {paper.className}
                          </p>
                        </div>
                        <h3 className="mt-1 font-medium text-foreground">{paper.title}</h3>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </>
      ) : (
        /* STUDENT: Class Papers with complete search & filters */
        <section>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
            <h2 className="font-semibold text-base text-foreground">
              📝 Đề thi trong lớp học ({classPapers.length})
            </h2>

            {classPapers.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {/* Class Filter */}
                {classNames.length > 1 && (
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="rounded-lg border border-line bg-card px-2.5 py-1.5 text-xs text-foreground focus:border-accent focus:outline-hidden"
                  >
                    <option value="ALL">Tất cả lớp ({classPapers.length})</option>
                    {classNames.map((name) => (
                      <option key={name} value={name}>
                        Lớp {name}
                      </option>
                    ))}
                  </select>
                )}

                {/* Kind Filter */}
                <select
                  value={selectedKind}
                  onChange={(e) => setSelectedKind(e.target.value)}
                  className="rounded-lg border border-line bg-card px-2.5 py-1.5 text-xs text-foreground focus:border-accent focus:outline-hidden"
                >
                  <option value="ALL">Tất cả hình thức</option>
                  <option value="EXAM">Thi / Kiểm tra</option>
                  <option value="ASSIGNMENT">Bài tập về nhà</option>
                  <option value="PRACTICE">Luyện tập</option>
                  <option value="PROMOTION">Thi thăng hạng</option>
                </select>

                {/* Search query */}
                <div className="relative min-w-[200px]">
                  <input
                    type="text"
                    placeholder="Tìm tên đề, giáo viên..."
                    value={paperSearchQuery}
                    onChange={(e) => setPaperSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-line bg-card py-1.5 pr-7 pl-8 text-xs text-foreground placeholder:text-muted focus:border-accent focus:outline-hidden"
                  />
                  <svg
                    className="pointer-events-none absolute top-2 left-2.5 h-3.5 w-3.5 text-muted"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {paperSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setPaperSearchQuery("")}
                      className="absolute top-1.5 right-2 text-xs text-muted hover:text-foreground"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {hasNoClassrooms ? (
            <EmptyState
              title="Chưa tham gia lớp học"
              description="Bạn chưa tham gia lớp học nào. Hãy liên hệ giáo viên để được thêm vào lớp."
            />
          ) : classPapers.length === 0 ? (
            <EmptyState
              title="Chưa có đề thi"
              description="Giáo viên chưa giao đề thi nào cho môn học này trong các lớp của bạn."
            />
          ) : filteredPapers.length === 0 ? (
            <div className="rounded-xl border border-dashed border-line bg-card/50 p-8 text-center text-xs text-muted">
              Không tìm thấy đề thi phù hợp với bộ lọc hiện tại.
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedClass("ALL");
                    setSelectedKind("ALL");
                    setPaperSearchQuery("");
                  }}
                  className="font-medium text-accent hover:underline"
                >
                  Xóa tất cả bộ lọc
                </button>
              </div>
            </div>
          ) : (
            <ul className="space-y-3">
              {filteredPapers.map((paper) => (
                <li key={paper.id}>
                  <Link
                    href={`/papers/${paper.id}`}
                    className="block rounded-xl border border-line bg-card p-5 hover:border-accent hover:shadow-xs transition"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs text-muted">
                        Lớp: <span className="font-medium text-foreground">{paper.className}</span> · ⏱ {paper.durationMinutes} phút ·{" "}
                        <span className="font-medium">{KIND_LABELS[paper.kind] ?? paper.kind}</span>
                      </p>
                      <span className="rounded bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
                        GV: {paper.teacherName}
                      </span>
                    </div>
                    <h3 className="mt-2 text-base font-semibold text-foreground">{paper.title}</h3>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
