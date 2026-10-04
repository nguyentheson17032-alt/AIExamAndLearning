"use client";

import { useMemo, useState } from "react";
import { StartAttemptButton } from "@/components/start-attempt-button";
import type { PaperSetItem } from "@/lib/types";

function foldText(val: string | null | undefined): string {
  if (!val) return "";
  return val
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/đ/gi, "d")
    .toLowerCase();
}

type DifficultyLevel = "ALL" | "BEGINNER" | "MEDIUM" | "ADVANCED" | "EXPERT";

const DIFFICULTY_CONFIG: Record<
  string,
  { label: string; badgeClass: string; order: number }
> = {
  BEGINNER: {
    label: "Cơ bản",
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    order: 1,
  },
  MEDIUM: {
    label: "Trung bình",
    badgeClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
    order: 2,
  },
  INTERMEDIATE: {
    label: "Trung bình",
    badgeClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
    order: 2,
  },
  ADVANCED: {
    label: "Nâng cao",
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    order: 3,
  },
  EXPERT: {
    label: "Chuyên sâu",
    badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    order: 4,
  },
};

function parsePaperMeta(title: string) {
  let difficulty: "BEGINNER" | "MEDIUM" | "ADVANCED" | "EXPERT" | null = null;
  let elo: number | null = null;
  let topic: string = "";

  const matchDifficulty = title.match(/\b(BEGINNER|MEDIUM|INTERMEDIATE|ADVANCED|EXPERT)\b/i);
  if (matchDifficulty) {
    const d = matchDifficulty[1].toUpperCase();
    if (d === "INTERMEDIATE" || d === "MEDIUM") difficulty = "MEDIUM";
    else if (d === "BEGINNER") difficulty = "BEGINNER";
    else if (d === "ADVANCED") difficulty = "ADVANCED";
    else if (d === "EXPERT") difficulty = "EXPERT";
  }

  const matchElo = title.match(/(\d{3,4})\s*Elo/i);
  if (matchElo) {
    elo = parseInt(matchElo[1], 10);
    if (!difficulty) {
      if (elo < 1000) difficulty = "BEGINNER";
      else if (elo < 1200) difficulty = "MEDIUM";
      else if (elo < 1400) difficulty = "ADVANCED";
      else difficulty = "EXPERT";
    }
  }

  // Tách dạng đề từ title (Ví dụ "Đề số 1: Tổng hợp (MEDIUM 1050 Elo)" -> "Tổng hợp")
  const cleanTitle = title
    .replace(/^Đề\s*(số)?\s*\d+\s*:\s*/i, "")
    .replace(/\(.*?\)/g, "")
    .trim();
  if (cleanTitle) {
    topic = cleanTitle;
  }

  return { difficulty, elo, topic };
}

type SortOption =
  | "exam_asc"
  | "exam_desc"
  | "difficulty_asc"
  | "difficulty_desc"
  | "questions_asc"
  | "questions_desc"
  | "duration_asc"
  | "duration_desc";

export function PaperSetFilterList({ papers }: { papers: PaperSetItem[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>("ALL");
  const [selectedTopic, setSelectedTopic] = useState<string>("ALL");
  const [selectedQuestionRange, setSelectedQuestionRange] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<SortOption>("exam_asc");

  // Parse metadata for all papers
  const parsedPapers = useMemo(() => {
    return papers.map((p) => {
      const meta = parsePaperMeta(p.title);
      return {
        ...p,
        ...meta,
      };
    });
  }, [papers]);

  // Distinct topics
  const topics = useMemo(() => {
    const set = new Set<string>();
    parsedPapers.forEach((p) => {
      if (p.topic && p.topic.length > 0) {
        set.add(p.topic);
      }
    });
    return Array.from(set);
  }, [parsedPapers]);

  // Distinct question count choices
  const availableQuestionCounts = useMemo(() => {
    const set = new Set<number>();
    papers.forEach((p) => {
      if (p.questionCount) set.add(p.questionCount);
    });
    return Array.from(set).sort((a, b) => a - b);
  }, [papers]);

  // Filtered & Sorted papers
  const filteredAndSortedPapers = useMemo(() => {
    let result = parsedPapers.filter((paper) => {
      // Difficulty filter
      if (selectedDifficulty !== "ALL") {
        if (paper.difficulty !== selectedDifficulty) {
          return false;
        }
      }

      // Topic / Dạng đề filter
      if (selectedTopic !== "ALL") {
        if (paper.topic !== selectedTopic) {
          return false;
        }
      }

      // Question count filter
      if (selectedQuestionRange !== "ALL") {
        if (selectedQuestionRange === "under_10" && paper.questionCount >= 10) return false;
        if (selectedQuestionRange === "10_to_25" && (paper.questionCount < 10 || paper.questionCount > 25)) return false;
        if (selectedQuestionRange === "above_25" && paper.questionCount <= 25) return false;
        if (selectedQuestionRange.startsWith("exact_")) {
          const exact = parseInt(selectedQuestionRange.replace("exact_", ""), 10);
          if (paper.questionCount !== exact) return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = foldText(searchQuery);
        const title = foldText(paper.title);
        const examNum = paper.examNumber ? `de ${paper.examNumber}` : "";
        const topic = foldText(paper.topic);
        const diff = paper.difficulty ? foldText(paper.difficulty) : "";
        if (!title.includes(q) && !examNum.includes(q) && !topic.includes(q) && !diff.includes(q)) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    result = [...result].sort((a, b) => {
      if (sortBy === "exam_asc") {
        return (a.examNumber ?? 0) - (b.examNumber ?? 0);
      }
      if (sortBy === "exam_desc") {
        return (b.examNumber ?? 0) - (a.examNumber ?? 0);
      }
      if (sortBy === "difficulty_asc") {
        const orderA = a.difficulty ? (DIFFICULTY_CONFIG[a.difficulty]?.order ?? 99) : 99;
        const orderB = b.difficulty ? (DIFFICULTY_CONFIG[b.difficulty]?.order ?? 99) : 99;
        if (orderA !== orderB) return orderA - orderB;
        return (a.elo ?? 0) - (b.elo ?? 0);
      }
      if (sortBy === "difficulty_desc") {
        const orderA = a.difficulty ? (DIFFICULTY_CONFIG[a.difficulty]?.order ?? 0) : 0;
        const orderB = b.difficulty ? (DIFFICULTY_CONFIG[b.difficulty]?.order ?? 0) : 0;
        if (orderA !== orderB) return orderB - orderA;
        return (b.elo ?? 0) - (a.elo ?? 0);
      }
      if (sortBy === "questions_asc") {
        return a.questionCount - b.questionCount;
      }
      if (sortBy === "questions_desc") {
        return b.questionCount - a.questionCount;
      }
      if (sortBy === "duration_asc") {
        return a.durationMinutes - b.durationMinutes;
      }
      if (sortBy === "duration_desc") {
        return b.durationMinutes - a.durationMinutes;
      }
      return 0;
    });

    return result;
  }, [parsedPapers, selectedDifficulty, selectedTopic, selectedQuestionRange, searchQuery, sortBy]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    selectedDifficulty !== "ALL" ||
    selectedTopic !== "ALL" ||
    selectedQuestionRange !== "ALL";

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedDifficulty("ALL");
    setSelectedTopic("ALL");
    setSelectedQuestionRange("ALL");
    setSortBy("exam_asc");
  };

  return (
    <div className="space-y-5">
      {/* FILTER CONTROLS BAR */}
      <div className="rounded-2xl border border-line bg-card p-4 shadow-2xs space-y-3">
        {/* Row 1: Search & Sort */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-md">
            <input
              type="text"
              placeholder="Tìm theo số đề, dạng đề, từ khóa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-line bg-background py-2 pr-8 pl-9 text-xs text-foreground placeholder:text-muted focus:border-accent focus:outline-hidden transition-colors"
            />
            <svg
              className="pointer-events-none absolute top-2.5 left-3 h-3.5 w-3.5 text-muted"
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
                className="absolute top-2.5 right-2.5 text-xs text-muted hover:text-foreground"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="sort-papers" className="text-xs text-muted whitespace-nowrap">
              Sắp xếp:
            </label>
            <select
              id="sort-papers"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="rounded-xl border border-line bg-background px-3 py-1.5 text-xs text-foreground focus:border-accent focus:outline-hidden"
            >
              <option value="exam_asc">Số đề (1 → Cuối)</option>
              <option value="exam_desc">Số đề (Cuối → 1)</option>
              <option value="difficulty_asc">Độ khó (Dễ → Khó)</option>
              <option value="difficulty_desc">Độ khó (Khó → Dễ)</option>
              <option value="questions_asc">Số câu (Tăng dần)</option>
              <option value="questions_desc">Số câu (Giảm dần)</option>
              <option value="duration_asc">Thời lượng (Ngắn → Dài)</option>
              <option value="duration_desc">Thời lượng (Dài → Ngắn)</option>
            </select>
          </div>
        </div>

        {/* Row 2: Filter Selectors (Độ khó, Dạng đề, Số câu) */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-line/60">
          {/* Lọc Độ khó */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium text-muted">🎯 Độ khó:</span>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value as DifficultyLevel)}
              className="rounded-lg border border-line bg-background px-2.5 py-1 text-xs text-foreground focus:border-accent focus:outline-hidden"
            >
              <option value="ALL">Tất cả độ khó</option>
              <option value="BEGINNER">Cơ bản (Beginner)</option>
              <option value="MEDIUM">Trung bình (Medium)</option>
              <option value="ADVANCED">Nâng cao (Advanced)</option>
              <option value="EXPERT">Chuyên sâu (Expert)</option>
            </select>
          </div>

          {/* Lọc Dạng đề */}
          {topics.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-muted">📑 Dạng đề:</span>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="rounded-lg border border-line bg-background px-2.5 py-1 text-xs text-foreground focus:border-accent focus:outline-hidden"
              >
                <option value="ALL">Tất cả dạng đề ({topics.length})</option>
                {topics.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Lọc Số câu */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium text-muted">📝 Số câu:</span>
            <select
              value={selectedQuestionRange}
              onChange={(e) => setSelectedQuestionRange(e.target.value)}
              className="rounded-lg border border-line bg-background px-2.5 py-1 text-xs text-foreground focus:border-accent focus:outline-hidden"
            >
              <option value="ALL">Tất cả số câu</option>
              {availableQuestionCounts.length <= 6 ? (
                availableQuestionCounts.map((count) => (
                  <option key={count} value={`exact_${count}`}>
                    {count} câu
                  </option>
                ))
              ) : (
                <>
                  <option value="under_10">Dưới 10 câu</option>
                  <option value="10_to_25">10 - 25 câu</option>
                  <option value="above_25">Trên 25 câu</option>
                </>
              )}
            </select>
          </div>

          {/* Clear filters button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="inline-flex items-center gap-1 rounded-lg bg-muted/15 px-2.5 py-1 text-xs font-medium text-muted hover:bg-muted/25 hover:text-foreground transition-colors"
            >
              ✕ Xóa bộ lọc
            </button>
          )}

          <div className="ml-auto text-xs text-muted">
            Hiển thị <span className="font-semibold text-foreground">{filteredAndSortedPapers.length}</span>/
            {papers.length} đề
          </div>
        </div>
      </div>

      {/* PAPERS LIST */}
      {filteredAndSortedPapers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-card/40 p-8 text-center">
          <p className="text-2xl mb-2">🔍</p>
          <h3 className="font-medium text-foreground">Không tìm thấy đề thi phù hợp</h3>
          <p className="mt-1 text-xs text-muted">
            Hãy thử thay đổi độ khó, dạng đề, số câu hoặc từ khóa tìm kiếm.
          </p>
          <button
            type="button"
            onClick={clearAllFilters}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-1.5 text-xs font-medium text-white hover:bg-accent-hover transition-colors"
          >
            Xóa tất cả bộ lọc
          </button>
        </div>
      ) : (
        <ol className="space-y-3">
          {filteredAndSortedPapers.map((paper) => {
            const diffMeta = paper.difficulty ? DIFFICULTY_CONFIG[paper.difficulty] : null;

            return (
              <li
                key={paper.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-card p-5 hover:border-accent/60 hover:shadow-xs transition-all"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-muted/15 px-2 py-0.5 font-mono text-xs font-semibold text-foreground">
                      Đề số {paper.examNumber ?? "—"}
                    </span>

                    <span className="text-xs text-muted">⏱ {paper.durationMinutes} phút</span>
                    <span className="text-xs text-muted">· 📝 {paper.questionCount} câu</span>

                    {diffMeta && (
                      <span
                        className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium ${diffMeta.badgeClass}`}
                      >
                        <span>{diffMeta.label}</span>
                        {paper.elo ? <span className="opacity-75">({paper.elo} Elo)</span> : null}
                      </span>
                    )}

                    {paper.topic && (
                      <span className="rounded-md border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
                        {paper.topic}
                      </span>
                    )}
                  </div>

                  <h2 className="font-semibold text-base text-foreground leading-snug">{paper.title}</h2>
                </div>

                <div className="shrink-0">
                  <StartAttemptButton paperId={paper.id} />
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
