"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { RemovePaperButton } from "@/components/remove-paper-button";
import type { ClassPaper, Difficulty, Subject } from "@/lib/types";

const DIFFICULTY_LABELS: Record<Difficulty, { label: string; badgeClass: string }> = {
  BEGINNER: {
    label: "Cơ bản",
    badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  },
  INTERMEDIATE: {
    label: "Trung bình",
    badgeClass: "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800",
  },
  ADVANCED: {
    label: "Nâng cao",
    badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  },
  EXPERT: {
    label: "Chuyên sâu",
    badgeClass: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800",
  },
};

function foldText(val: string | null | undefined): string {
  if (!val) return "";
  return val
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/đ/gi, "d")
    .toLowerCase();
}

export function ClassroomPapersList({
  classroomId,
  isTeacher,
  papers = [],
  subjects = [],
}: {
  classroomId: string;
  isTeacher: boolean;
  papers: ClassPaper[];
  subjects?: Subject[];
}) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Map of subjectId -> Subject name & code
  const subjectMap = useMemo(() => {
    const map = new Map<string, { name: string; code: string }>();
    subjects.forEach((s) => map.set(s.id, { name: s.name, code: s.code }));
    papers.forEach((p) => {
      if (p.subjectId && !map.has(p.subjectId)) {
        map.set(p.subjectId, {
          name: p.subjectName || "Môn học",
          code: p.subjectCode || "",
        });
      }
    });
    return map;
  }, [subjects, papers]);

  // Distinct subjects present in this classroom
  const activeSubjects = useMemo(() => {
    const counts = new Map<string, number>();
    papers.forEach((p) => {
      if (p.subjectId) {
        counts.set(p.subjectId, (counts.get(p.subjectId) || 0) + 1);
      }
    });

    const list: { id: string; name: string; code: string; count: number }[] = [];
    counts.forEach((count, subjectId) => {
      const info = subjectMap.get(subjectId) || { name: "Môn học", code: "" };
      list.push({ id: subjectId, name: info.name, code: info.code, count });
    });
    return list;
  }, [papers, subjectMap]);

  // Filtered papers
  const filteredPapers = useMemo(() => {
    return papers.filter((paper) => {
      // Subject filter
      if (selectedSubjectId !== "ALL" && paper.subjectId !== selectedSubjectId) {
        return false;
      }
      // Search query
      if (searchQuery.trim().length > 0) {
        const q = foldText(searchQuery);
        const title = foldText(paper.title);
        const examNum = paper.examNumber ? `de ${paper.examNumber}` : "";
        const subName = paper.subjectId && subjectMap.has(paper.subjectId) ? foldText(subjectMap.get(paper.subjectId)!.name) : "";
        if (!title.includes(q) && !examNum.includes(q) && !subName.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [papers, selectedSubjectId, searchQuery, subjectMap]);

  if (papers.length === 0) {
    return <p className="text-sm text-muted">Chưa có bài nào trong lớp.</p>;
  }

  return (
    <div className="space-y-4">
      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Subject Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedSubjectId("ALL")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              selectedSubjectId === "ALL"
                ? "bg-accent text-white shadow-xs"
                : "border border-line bg-card text-muted hover:bg-background hover:text-foreground"
            }`}
          >
            <span>Tất cả môn</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                selectedSubjectId === "ALL" ? "bg-white/20 text-white" : "bg-muted/15 text-muted"
              }`}
            >
              {papers.length}
            </span>
          </button>

          {activeSubjects.map((sub) => {
            const isSelected = selectedSubjectId === sub.id;
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => setSelectedSubjectId(sub.id)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  isSelected
                    ? "bg-accent text-white shadow-xs"
                    : "border border-line bg-card text-muted hover:bg-background hover:text-foreground"
                }`}
              >
                <span>{sub.name}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                    isSelected ? "bg-white/20 text-white" : "bg-muted/15 text-muted"
                  }`}
                >
                  {sub.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search within classroom papers */}
        {papers.length > 3 && (
          <div className="relative min-w-[200px]">
            <input
              type="text"
              placeholder="Tìm bài trong lớp..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-line bg-card py-1.5 pr-7 pl-8 text-xs text-foreground placeholder:text-muted focus:border-accent focus:outline-hidden"
            />
            <svg
              className="pointer-events-none absolute top-2 left-2.5 h-3.5 w-3.5 text-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute top-1.5 right-2 text-xs text-muted hover:text-foreground"
              >
                ✕
              </button>
            )}
          </div>
        )}
      </div>

      {/* Papers List */}
      {filteredPapers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-muted">
          Không tìm thấy bài nào phù hợp với bộ lọc.
          {(selectedSubjectId !== "ALL" || searchQuery) && (
            <div className="mt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedSubjectId("ALL");
                  setSearchQuery("");
                }}
                className="text-xs font-medium text-accent hover:underline"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}
        </div>
      ) : (
        <ul className="divide-y divide-line rounded-xl border border-line bg-card">
          {filteredPapers.map((paper) => {
            const subjectInfo = paper.subjectId ? subjectMap.get(paper.subjectId) : null;
            const diffInfo = paper.difficulty ? DIFFICULTY_LABELS[paper.difficulty] : null;

            return (
              <li
                key={paper.id}
                className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-background/40"
              >
                <Link href={`/papers/${paper.id}`} className="min-w-0 flex-1 group">
                  <div className="flex flex-wrap items-center gap-2">
                    {paper.examNumber ? (
                      <span className="rounded-md bg-muted/15 px-1.5 py-0.2 font-mono text-[10px] font-semibold text-muted">
                        Đề {String(paper.examNumber).padStart(2, "0")}
                      </span>
                    ) : null}
                    <span className="font-medium text-foreground group-hover:text-accent">
                      {paper.title}
                    </span>
                    {subjectInfo && (
                      <span className="rounded-md border border-indigo-200 bg-indigo-50 px-1.5 py-0.2 text-[10px] font-medium text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300">
                        {subjectInfo.name}
                      </span>
                    )}
                    {diffInfo && (
                      <span
                        className={`rounded-md border px-1.5 py-0.2 text-[10px] font-medium ${diffInfo.badgeClass}`}
                      >
                        {diffInfo.label}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted">
                    <span>⏱ {paper.durationMinutes} phút</span>
                    {paper.questionCount ? <span>· 📝 {paper.questionCount} câu</span> : null}
                  </div>
                </Link>
                {isTeacher ? <RemovePaperButton classroomId={classroomId} paperId={paper.id} /> : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
