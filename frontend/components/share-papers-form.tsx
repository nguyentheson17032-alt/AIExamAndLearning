"use client";

import { useActionState, useId, useMemo, useState } from "react";
import { sharePapersAction, type ClassroomFormState } from "@/lib/classroom-actions";
import { ProblemAlert } from "@/components/problem-alert";
import { SubmitButton } from "@/components/submit-button";
import type { ClassPaper, Difficulty, SharePaperSetOption, Subject } from "@/lib/types";

type DifficultyFilter = "ALL" | Difficulty;
type QuestionCountFilter = "ALL" | "3" | "5" | "10" | "15" | "20";
type FormatFilter =
  | "ALL"
  | "linear"
  | "quadratic"
  | "system"
  | "word_problem";

const DIFFICULTY_LABELS: Record<Difficulty, { label: string; badgeClass: string }> = {
  BEGINNER: {
    label: "Cơ bản (Easy)",
    badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  },
  INTERMEDIATE: {
    label: "Trung bình (Medium)",
    badgeClass: "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800",
  },
  ADVANCED: {
    label: "Nâng cao (Hard)",
    badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  },
  EXPERT: {
    label: "Chuyên sâu (Expert)",
    badgeClass: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800",
  },
};

const FORMAT_LABELS: Record<string, string> = {
  linear: "Phương trình bậc 1",
  quadratic: "Phương trình bậc 2",
  system: "Hệ 2 phương trình bậc nhất",
  word_problem: "Toán thực tế / Lời văn",
};

function foldText(val: string | null | undefined): string {
  if (!val) return "";
  return val
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/đ/gi, "d")
    .toLowerCase();
}

function matchesQuestionCount(count: number, filter: QuestionCountFilter): boolean {
  if (filter === "ALL") return true;
  if (filter === "3") return count === 3;
  if (filter === "5") return count === 5;
  if (filter === "10") return count === 10;
  if (filter === "15") return count === 15;
  if (filter === "20") return count === 20;
  return true;
}

function matchesFormat(paper: ClassPaper, filter: FormatFilter): boolean {
  if (filter === "ALL") return true;
  const title = foldText(paper.title);

  if (filter === "linear") {
    return title.includes("bac 1") || title.includes("bac nhat") || title.includes("linear");
  }
  if (filter === "quadratic") {
    return title.includes("bac 2") || title.includes("quadratic");
  }
  if (filter === "system") {
    return title.includes("he 2") || title.includes("he phuong trinh") || title.includes("system");
  }
  if (filter === "word_problem") {
    return title.includes("thuc te") || title.includes("loi van") || title.includes("word");
  }
  return false;
}

function matchesDifficulty(paper: ClassPaper, filter: DifficultyFilter): boolean {
  if (filter === "ALL") return true;
  return paper.difficulty === filter;
}

function matchesSubject(subjectId: string | undefined | null, filter: string): boolean {
  if (filter === "ALL") return true;
  return subjectId === filter;
}

function matchesSearch(paper: ClassPaper, query: string): boolean {
  if (!query) return true;
  const q = foldText(query);
  const title = foldText(paper.title);
  const examNum = paper.examNumber ? `de ${paper.examNumber}` : "";
  return title.includes(q) || examNum.includes(q);
}

export function SharePapersForm({
  classroomId,
  papers = [],
  paperSets = [],
  subjects = [],
}: {
  classroomId: string;
  papers?: ClassPaper[];
  paperSets?: SharePaperSetOption[];
  subjects?: Subject[];
}) {
  const formId = useId();
  const [state, action] = useActionState(sharePapersAction.bind(null, classroomId), null as ClassroomFormState);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState<string>("ALL");
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("ALL");
  const [countFilter, setCountFilter] = useState<QuestionCountFilter>("ALL");
  const [formatFilter, setFormatFilter] = useState<FormatFilter>("ALL");

  // Distinct subjects available
  const availableSubjects = useMemo(() => {
    const map = new Map<string, { id: string; name: string; code: string }>();
    if (subjects && subjects.length > 0) {
      subjects.forEach((s) => map.set(s.id, { id: s.id, name: s.name, code: s.code }));
    }
    papers.forEach((p) => {
      if (p.subjectId && !map.has(p.subjectId)) {
        map.set(p.subjectId, {
          id: p.subjectId,
          name: p.subjectName || "Môn học",
          code: p.subjectCode || "",
        });
      }
    });
    paperSets.forEach((s) => {
      if (s.subjectId && !map.has(s.subjectId)) {
        map.set(s.subjectId, {
          id: s.subjectId,
          name: s.subjectName || "Môn học",
          code: s.subjectCode || "",
        });
      }
    });
    return Array.from(map.values());
  }, [subjects, papers, paperSets]);

  // Accordion state: set of expanded paperSet IDs
  const [expandedSetIds, setExpandedSetIds] = useState<Set<string>>(() => {
    // Expand by default if there's only 1 set
    if (paperSets.length === 1) {
      return new Set([paperSets[0].id]);
    }
    return new Set<string>();
  });

  // Selected state for individual papers and sets
  const [selectedPaperIds, setSelectedPaperIds] = useState<Set<string>>(new Set());
  const [selectedSetIds, setSelectedSetIds] = useState<Set<string>>(new Set());

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    subjectFilter !== "ALL" ||
    difficultyFilter !== "ALL" ||
    countFilter !== "ALL" ||
    formatFilter !== "ALL";

  const handleResetFilters = () => {
    setSearchQuery("");
    setSubjectFilter("ALL");
    setDifficultyFilter("ALL");
    setCountFilter("ALL");
    setFormatFilter("ALL");
  };

  const toggleSetExpanded = (setId: string) => {
    setExpandedSetIds((prev) => {
      const next = new Set(prev);
      if (next.has(setId)) {
        next.delete(setId);
      } else {
        next.add(setId);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedSetIds(new Set(paperSets.map((s) => s.id)));
  };

  const collapseAll = () => {
    setExpandedSetIds(new Set());
  };

  // Process filtered standalone papers
  const filteredPapers = useMemo(() => {
    return papers.filter((p) => {
      return (
        matchesSubject(p.subjectId, subjectFilter) &&
        matchesSearch(p, searchQuery) &&
        matchesDifficulty(p, difficultyFilter) &&
        matchesQuestionCount(p.questionCount ?? 0, countFilter) &&
        matchesFormat(p, formatFilter)
      );
    });
  }, [papers, searchQuery, subjectFilter, difficultyFilter, countFilter, formatFilter]);

  // Process filtered paper sets and their inner papers
  const filteredSetsData = useMemo(() => {
    return paperSets
      .map((set) => {
        const innerPapers = set.papers ?? [];
        const matchesSetSubject = matchesSubject(set.subjectId, subjectFilter);

        const matchingPapers = innerPapers.filter((p) => {
          return (
            matchesSubject(p.subjectId || set.subjectId, subjectFilter) &&
            matchesSearch(p, searchQuery) &&
            matchesDifficulty(p, difficultyFilter) &&
            matchesQuestionCount(p.questionCount ?? 0, countFilter) &&
            matchesFormat(p, formatFilter)
          );
        });

        const matchesSetTitle =
          searchQuery.trim().length > 0 &&
          (foldText(set.title).includes(foldText(searchQuery)) ||
            (set.academicYear && foldText(set.academicYear).includes(foldText(searchQuery))));

        // Set is visible if inner papers match or if set title matches query (and no specific type/diff filters restrict it)
        const isVisible =
          matchingPapers.length > 0 ||
          (matchesSetTitle &&
            matchesSetSubject &&
            difficultyFilter === "ALL" &&
            countFilter === "ALL" &&
            formatFilter === "ALL");

        return {
          set,
          innerPapers,
          matchingPapers: matchingPapers.length > 0 ? matchingPapers : matchesSetTitle && matchesSetSubject ? innerPapers : [],
          isVisible,
        };
      })
      .filter((item) => item.isVisible);
  }, [paperSets, searchQuery, subjectFilter, difficultyFilter, countFilter, formatFilter]);

  // Handle set selection toggle
  const toggleSetSelection = (setId: string, availablePapers: ClassPaper[]) => {
    const unlinkedPapers = availablePapers.filter((p) => !p.inClass);
    const unlinkedPaperIds = unlinkedPapers.map((p) => p.id);
    const allSelected = unlinkedPaperIds.length > 0 && unlinkedPaperIds.every((id) => selectedPaperIds.has(id));

    setSelectedPaperIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        unlinkedPaperIds.forEach((id) => next.delete(id));
      } else {
        unlinkedPaperIds.forEach((id) => next.add(id));
      }
      return next;
    });

    setSelectedSetIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        next.delete(setId);
      } else {
        next.add(setId);
      }
      return next;
    });
  };

  const togglePaperSelection = (paperId: string, setId?: string, setPapers?: ClassPaper[]) => {
    setSelectedPaperIds((prev) => {
      const next = new Set(prev);
      if (next.has(paperId)) {
        next.delete(paperId);
      } else {
        next.add(paperId);
      }

      // Check if all papers in the set are now selected
      if (setId && setPapers) {
        const unlinked = setPapers.filter((p) => !p.inClass).map((p) => p.id);
        const allNowSelected = unlinked.length > 0 && unlinked.every((id) => next.has(id));
        setSelectedSetIds((prevSets) => {
          const nextSets = new Set(prevSets);
          if (allNowSelected) {
            nextSets.add(setId);
          } else {
            nextSets.delete(setId);
          }
          return nextSets;
        });
      }

      return next;
    });
  };

  const selectAllVisible = () => {
    const nextPapers = new Set(selectedPaperIds);
    const nextSets = new Set(selectedSetIds);

    filteredPapers.forEach((p) => nextPapers.add(p.id));

    filteredSetsData.forEach(({ set, matchingPapers }) => {
      matchingPapers.filter((p) => !p.inClass).forEach((p) => nextPapers.add(p.id));
      nextSets.add(set.id);
    });

    setSelectedPaperIds(nextPapers);
    setSelectedSetIds(nextSets);
  };

  const deselectAll = () => {
    setSelectedPaperIds(new Set());
    setSelectedSetIds(new Set());
  };

  const totalSelectedCount = selectedPaperIds.size;
  const empty = papers.length === 0 && paperSets.length === 0;

  return (
    <form action={action} className="space-y-5 rounded-2xl border border-line bg-card p-5 shadow-xs sm:p-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Đưa đề vào lớp</h2>
          <p className="text-sm text-muted">
            Chọn đề lẻ hoặc mở rộng bộ đề để xem từng đề thi, áp dụng bộ lọc theo độ khó, số câu và dạng.
          </p>
        </div>
        {totalSelectedCount > 0 && (
          <div className="mt-2 flex items-center gap-2 self-start rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent sm:mt-0 sm:self-auto">
            <span>Đã chọn {totalSelectedCount} đề</span>
          </div>
        )}
      </div>

      {state?.error ? <ProblemAlert message={state.error} /> : null}
      {state?.message ? (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3.5 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
          {state.message}
        </div>
      ) : null}

      {empty ? (
        <p className="py-4 text-sm text-muted">Mọi đề và bộ đề của bạn đã có trong lớp.</p>
      ) : (
        <>
          {/* Filter Bar */}
          <div className="space-y-3 rounded-xl border border-line/80 bg-background/50 p-3.5 sm:p-4">
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
              {/* Search box */}
              <div className="relative flex-1">
                <input
                  id={`${formId}-search`}
                  type="text"
                  placeholder="Tìm kiếm theo tên đề, mã đề, số đề..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-line bg-card py-1.5 pr-8 pl-9 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-hidden"
                />
                <svg
                  className="pointer-events-none absolute top-2.5 left-2.5 h-4 w-4 text-muted"
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
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute top-2 right-2 text-xs text-muted hover:text-foreground"
                    title="Xóa tìm kiếm"
                  >
                    ✕
                  </button>
                ) : null}
              </div>

              {/* Reset filter button */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-line bg-card px-2.5 py-1.5 text-xs font-medium text-muted hover:bg-background hover:text-foreground"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.038 8.038 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Đặt lại lọc
                </button>
              )}
            </div>

            {/* Filter selectors */}
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
              {/* Filter: Subject */}
              <div>
                <label htmlFor={`${formId}-subject`} className="mb-1 block text-xs font-semibold text-muted">
                  📚 Môn học
                </label>
                <select
                  id={`${formId}-subject`}
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="w-full rounded-lg border border-line bg-card px-2.5 py-1.5 text-xs text-foreground focus:border-accent focus:outline-hidden"
                >
                  <option value="ALL">🌐 Tất cả môn học</option>
                  {availableSubjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} {sub.code ? `(${sub.code})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter: Difficulty */}
              <div>
                <label htmlFor={`${formId}-difficulty`} className="mb-1 block text-xs font-semibold text-muted">
                  ⚡ Độ khó
                </label>
                <select
                  id={`${formId}-difficulty`}
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value as DifficultyFilter)}
                  className="w-full rounded-lg border border-line bg-card px-2.5 py-1.5 text-xs text-foreground focus:border-accent focus:outline-hidden"
                >
                  <option value="ALL">🌟 Tất cả độ khó</option>
                  <option value="BEGINNER">Cơ bản (Easy - 900 Elo)</option>
                  <option value="INTERMEDIATE">Trung bình (Medium - 1050 Elo)</option>
                  <option value="ADVANCED">Nâng cao (Hard - 1250 Elo)</option>
                  <option value="EXPERT">Chuyên sâu (Expert - 1400+ Elo)</option>
                </select>
              </div>

              {/* Filter: Question count */}
              <div>
                <label htmlFor={`${formId}-count`} className="mb-1 block text-xs font-semibold text-muted">
                  📝 Số lượng câu
                </label>
                <select
                  id={`${formId}-count`}
                  value={countFilter}
                  onChange={(e) => setCountFilter(e.target.value as QuestionCountFilter)}
                  className="w-full rounded-lg border border-line bg-card px-2.5 py-1.5 text-xs text-foreground focus:border-accent focus:outline-hidden"
                >
                  <option value="ALL">📋 Tất cả số câu</option>
                  <option value="3">3 câu (Luyện nhanh)</option>
                  <option value="5">5 câu (Tiêu chuẩn)</option>
                  <option value="10">10 câu (Đầy đủ)</option>
                  <option value="15">15 câu (Đề thi thử)</option>
                  <option value="20">20 câu (Toàn diện)</option>
                </select>
              </div>

              {/* Filter: Format & Type */}
              <div>
                <label htmlFor={`${formId}-format`} className="mb-1 block text-xs font-semibold text-muted">
                  🎯 Chủ đề dạng
                </label>
                <select
                  id={`${formId}-format`}
                  value={formatFilter}
                  onChange={(e) => setFormatFilter(e.target.value as FormatFilter)}
                  className="w-full rounded-lg border border-line bg-card px-2.5 py-1.5 text-xs text-foreground focus:border-accent focus:outline-hidden"
                >
                  <option value="ALL">🌟 Tất cả dạng toán</option>
                  <option value="linear">Phương trình bậc 1</option>
                  <option value="quadratic">Phương trình bậc 2</option>
                  <option value="system">Hệ 2 phương trình bậc nhất</option>
                  <option value="word_problem">Toán thực tế / Lời văn</option>
                </select>
              </div>
            </div>

            {/* Batch toggle bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line/60 pt-2 text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={selectAllVisible}
                  className="font-medium text-accent hover:underline"
                >
                  Chọn tất cả đang hiển thị
                </button>
                <span className="text-muted">·</span>
                <button
                  type="button"
                  onClick={deselectAll}
                  className="font-medium text-muted hover:text-foreground hover:underline"
                >
                  Bỏ chọn tất cả
                </button>
              </div>
              {paperSets.length > 0 && (
                <div className="flex items-center gap-2 text-muted">
                  <button
                    type="button"
                    onClick={expandAll}
                    className="hover:text-foreground hover:underline"
                  >
                    Mở rộng tất cả bộ đề
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={collapseAll}
                    className="hover:text-foreground hover:underline"
                  >
                    Thu gọn tất cả
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* List of Paper Sets */}
          {paperSets.length > 0 ? (
            <fieldset className="space-y-3">
              <legend className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <span>Bộ đề</span>
                <span className="rounded-md bg-muted/15 px-2 py-0.5 text-xs font-normal text-muted">
                  {filteredSetsData.length} / {paperSets.length} bộ đề
                </span>
              </legend>

              {filteredSetsData.length === 0 ? (
                <div className="rounded-xl border border-dashed border-line p-4 text-center text-xs text-muted">
                  Không tìm thấy bộ đề nào phù hợp với bộ lọc hiện tại.
                </div>
              ) : (
                <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
                  {filteredSetsData.map(({ set, innerPapers, matchingPapers }) => {
                    const isExpanded = expandedSetIds.has(set.id);
                    const unlinkedInner = innerPapers.filter((p) => !p.inClass);
                    const selectedInnerCount = unlinkedInner.filter((p) => selectedPaperIds.has(p.id)).length;
                    const isSetFullySelected = unlinkedInner.length > 0 && selectedInnerCount === unlinkedInner.length;
                    const isSetPartiallySelected = selectedInnerCount > 0 && !isSetFullySelected;

                    return (
                      <div
                        key={set.id}
                        className={`rounded-xl border transition-colors ${isExpanded ? "border-accent/40 bg-card shadow-xs" : "border-line bg-card/70 hover:border-line"
                          }`}
                      >
                        {/* Paper Set Header Row */}
                        <div className="flex items-center justify-between gap-3 p-3.5">
                          <div className="flex min-w-0 flex-1 items-center gap-2.5">
                            <input
                              type="checkbox"
                              name="paperSetId"
                              value={set.id}
                              checked={isSetFullySelected}
                              ref={(el) => {
                                if (el) el.indeterminate = isSetPartiallySelected;
                              }}
                              onChange={() => toggleSetSelection(set.id, innerPapers)}
                              className="h-4 w-4 rounded-sm border-line text-accent focus:ring-accent"
                              aria-label={`Chọn tất cả đề trong bộ đề ${set.title}`}
                            />
                            <div
                              onClick={() => toggleSetExpanded(set.id)}
                              className="min-w-0 flex-1 cursor-pointer select-none"
                            >
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-medium text-foreground hover:text-accent">
                                  {set.title}
                                </span>
                                {set.subjectName && (
                                  <span className="rounded-md border border-indigo-200 bg-indigo-50 px-1.5 py-0.2 text-[10px] font-medium text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300">
                                    {set.subjectName}
                                  </span>
                                )}
                                {set.academicYear && (
                                  <span className="rounded-md border border-line bg-background px-1.5 py-0.2 text-[11px] text-muted">
                                    {set.academicYear}
                                  </span>
                                )}
                              </div>
                              <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted">
                                <span>{set.paperCount} đề thi</span>
                                {matchingPapers.length !== innerPapers.length && (
                                  <span className="font-medium text-accent">
                                    · Khớp {matchingPapers.length} đề
                                  </span>
                                )}
                                {selectedInnerCount > 0 && (
                                  <span className="font-medium text-accent">
                                    · Đã chọn {selectedInnerCount}/{unlinkedInner.length} đề
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Toggle Expand Button */}
                          <button
                            type="button"
                            onClick={() => toggleSetExpanded(set.id)}
                            className="flex items-center gap-1 rounded-lg border border-line bg-background/80 px-2.5 py-1 text-xs font-medium text-muted hover:bg-background hover:text-foreground"
                          >
                            <span>{isExpanded ? "Thu gọn" : "Xem tất cả đề"}</span>
                            <svg
                              className={`h-3.5 w-3.5 transform transition-transform ${isExpanded ? "rotate-180" : ""}`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>

                        {/* Expanded Inner Papers List */}
                        {isExpanded && (
                          <div className="border-t border-line/60 bg-background/40 p-3">
                            <div className="mb-2 flex items-center justify-between text-xs text-muted">
                              <span className="font-medium">
                                Danh sách đề trong bộ ({matchingPapers.length} đề hiển thị):
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = new Set(selectedPaperIds);
                                    matchingPapers.filter((p) => !p.inClass).forEach((p) => next.add(p.id));
                                    setSelectedPaperIds(next);
                                  }}
                                  className="text-accent hover:underline"
                                >
                                  Chọn tất cả đề này
                                </button>
                                <span>·</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = new Set(selectedPaperIds);
                                    matchingPapers.forEach((p) => next.delete(p.id));
                                    setSelectedPaperIds(next);
                                    setSelectedSetIds((prev) => {
                                      const s = new Set(prev);
                                      s.delete(set.id);
                                      return s;
                                    });
                                  }}
                                  className="text-muted hover:text-foreground hover:underline"
                                >
                                  Bỏ chọn
                                </button>
                              </div>
                            </div>

                            {matchingPapers.length === 0 ? (
                              <p className="py-2 text-center text-xs text-muted">
                                Không có đề nào trong bộ này khớp với bộ lọc.
                              </p>
                            ) : (
                              <ul className="divide-y divide-line/40 rounded-lg border border-line/60 bg-card">
                                {matchingPapers.map((paper) => {
                                  const isChecked = selectedPaperIds.has(paper.id);
                                  const diffInfo = paper.difficulty ? DIFFICULTY_LABELS[paper.difficulty] : null;
                                  const paperSubName = paper.subjectName || (paper.subjectId ? availableSubjects.find((s) => s.id === paper.subjectId)?.name : null);

                                  return (
                                    <li
                                      key={paper.id}
                                      className={`flex items-start gap-3 p-2.5 text-xs transition-colors ${paper.inClass ? "opacity-60" : isChecked ? "bg-accent/5" : "hover:bg-background/60"
                                        }`}
                                    >
                                      <input
                                        type="checkbox"
                                        name="paperId"
                                        value={paper.id}
                                        disabled={paper.inClass}
                                        checked={isChecked || !!paper.inClass}
                                        onChange={() => togglePaperSelection(paper.id, set.id, innerPapers)}
                                        className="mt-0.5 h-3.5 w-3.5 rounded-sm border-line text-accent focus:ring-accent disabled:opacity-50"
                                        aria-label={`Chọn đề ${paper.title}`}
                                      />
                                      <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-1.5">
                                          {paper.examNumber ? (
                                            <span className="rounded-md bg-muted/15 px-1.5 py-0.2 font-mono text-[10px] font-semibold text-muted">
                                              Đề {String(paper.examNumber).padStart(2, "0")}
                                            </span>
                                          ) : null}
                                          <span className="font-medium text-foreground">{paper.title}</span>
                                          {paperSubName && (
                                            <span className="rounded-md border border-indigo-200 bg-indigo-50 px-1.5 py-0.2 text-[10px] font-medium text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300">
                                              {paperSubName}
                                            </span>
                                          )}
                                          {paper.inClass && (
                                            <span className="rounded-md bg-muted/20 px-1.5 py-0.2 text-[10px] text-muted">
                                              ✓ Đã có trong lớp
                                            </span>
                                          )}
                                        </div>

                                        {/* Metadata badges */}
                                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-muted">
                                          <span>⏱ {paper.durationMinutes} phút</span>
                                          {paper.questionCount ? <span>· 📝 {paper.questionCount} câu</span> : null}

                                          {/* Difficulty badge */}
                                          {diffInfo && (
                                            <span
                                              className={`rounded-md border px-1.5 py-0.2 text-[10px] font-medium ${diffInfo.badgeClass}`}
                                            >
                                              {diffInfo.label}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </fieldset>
          ) : null}

          {/* List of Standalone Papers ("Đề lẻ") */}
          {papers.length > 0 ? (
            <fieldset className="space-y-3">
              <legend className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <span>Đề lẻ</span>
                <span className="rounded-md bg-muted/15 px-2 py-0.5 text-xs font-normal text-muted">
                  {filteredPapers.length} / {papers.length} đề
                </span>
              </legend>

              {filteredPapers.length === 0 ? (
                <div className="rounded-xl border border-dashed border-line p-4 text-center text-xs text-muted">
                  Không tìm thấy đề lẻ nào phù hợp với bộ lọc hiện tại.
                </div>
              ) : (
                <ul className="max-h-64 divide-y divide-line rounded-xl border border-line bg-card overflow-y-auto">
                  {filteredPapers.map((paper) => {
                    const isChecked = selectedPaperIds.has(paper.id);
                    const diffInfo = paper.difficulty ? DIFFICULTY_LABELS[paper.difficulty] : null;
                    const paperSubName = paper.subjectName || (paper.subjectId ? availableSubjects.find((s) => s.id === paper.subjectId)?.name : null);

                    return (
                      <li
                        key={paper.id}
                        className={`flex items-start gap-3 p-3 text-xs transition-colors ${isChecked ? "bg-accent/5" : "hover:bg-background/60"
                          }`}
                      >
                        <input
                          type="checkbox"
                          name="paperId"
                          value={paper.id}
                          checked={isChecked}
                          onChange={() => togglePaperSelection(paper.id)}
                          className="mt-0.5 h-4 w-4 rounded-sm border-line text-accent focus:ring-accent"
                          aria-label={`Chọn đề lẻ ${paper.title}`}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-medium text-foreground">{paper.title}</span>
                            {paperSubName && (
                              <span className="rounded-md border border-indigo-200 bg-indigo-50 px-1.5 py-0.2 text-[10px] font-medium text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300">
                                {paperSubName}
                              </span>
                            )}
                          </div>
                          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-muted">
                            <span>⏱ {paper.durationMinutes} phút</span>
                            {paper.questionCount ? <span>· 📝 {paper.questionCount} câu</span> : null}

                            {diffInfo && (
                              <span
                                className={`rounded-md border px-1.5 py-0.2 text-[10px] font-medium ${diffInfo.badgeClass}`}
                              >
                                {diffInfo.label}
                              </span>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </fieldset>
          ) : null}

          {/* Submit Action Bar */}
          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between border-t border-line">
            <div className="text-xs text-muted">
              {totalSelectedCount > 0 ? (
                <span>
                  Sẵn sàng đưa <strong className="text-foreground">{totalSelectedCount}</strong> đề vào lớp.
                </span>
              ) : (
                <span>Chưa chọn đề nào để đưa vào lớp.</span>
              )}
            </div>
            <SubmitButton pendingLabel="Đang đưa bài…">Đưa vào lớp</SubmitButton>
          </div>
        </>
      )}
    </form>
  );
}
