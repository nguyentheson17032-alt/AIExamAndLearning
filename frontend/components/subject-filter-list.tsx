"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Subject } from "@/lib/types";

function foldText(val: string | null | undefined): string {
  if (!val) return "";
  return val
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/đ/gi, "d")
    .toLowerCase();
}

function getSubjectIcon(code: string, name: string): { icon: string; colorClass: string; bgClass: string } {
  const c = code.toUpperCase();
  const n = foldText(name);

  if (c.includes("MATH") || n.includes("toan")) {
    return { icon: "📐", colorClass: "text-blue-600 dark:text-blue-400", bgClass: "bg-blue-500/10 border-blue-500/20" };
  }
  if (c.includes("PHYS") || n.includes("ly") || n.includes("vat li")) {
    return { icon: "⚡", colorClass: "text-amber-600 dark:text-amber-400", bgClass: "bg-amber-500/10 border-amber-500/20" };
  }
  if (c.includes("CHEM") || n.includes("hoa")) {
    return { icon: "🧪", colorClass: "text-emerald-600 dark:text-emerald-400", bgClass: "bg-emerald-500/10 border-emerald-500/20" };
  }
  if (c.includes("BIO") || n.includes("sinh")) {
    return { icon: "🧬", colorClass: "text-green-600 dark:text-green-400", bgClass: "bg-green-500/10 border-green-500/20" };
  }
  if (c.includes("ENG") || n.includes("anh") || n.includes("ngoai ngu")) {
    return { icon: "🌐", colorClass: "text-purple-600 dark:text-purple-400", bgClass: "bg-purple-500/10 border-purple-500/20" };
  }
  if (c.includes("INFO") || c.includes("CS") || n.includes("tin")) {
    return { icon: "💻", colorClass: "text-cyan-600 dark:text-cyan-400", bgClass: "bg-cyan-500/10 border-cyan-500/20" };
  }
  if (c.includes("LIT") || n.includes("van") || n.includes("ngu van")) {
    return { icon: "📖", colorClass: "text-rose-600 dark:text-rose-400", bgClass: "bg-rose-500/10 border-rose-500/20" };
  }
  if (c.includes("HIST") || n.includes("su") || n.includes("lich su")) {
    return { icon: "🏛️", colorClass: "text-orange-600 dark:text-orange-400", bgClass: "bg-orange-500/10 border-orange-500/20" };
  }
  if (c.includes("GEO") || n.includes("dia")) {
    return { icon: "🌍", colorClass: "text-teal-600 dark:text-teal-400", bgClass: "bg-teal-500/10 border-teal-500/20" };
  }

  return { icon: "📚", colorClass: "text-indigo-600 dark:text-indigo-400", bgClass: "bg-indigo-500/10 border-indigo-500/20" };
}

type SortOption = "name_asc" | "name_desc" | "newest" | "oldest";

export function SubjectFilterList({
  subjects,
  isTeacher,
}: {
  subjects: Subject[];
  isTeacher: boolean;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("name_asc");

  const filteredAndSortedSubjects = useMemo(() => {
    let list = subjects.filter((subject) => {
      if (!searchQuery.trim()) return true;
      const q = foldText(searchQuery);
      const name = foldText(subject.name);
      const code = foldText(subject.code);
      const desc = foldText(subject.description);
      return name.includes(q) || code.includes(q) || desc.includes(q);
    });

    list = [...list].sort((a, b) => {
      if (sortBy === "name_asc") {
        return a.name.localeCompare(b.name, "vi");
      }
      if (sortBy === "name_desc") {
        return b.name.localeCompare(a.name, "vi");
      }
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return 0;
    });

    return list;
  }, [subjects, searchQuery, sortBy]);

  const hasFilter = searchQuery.trim().length > 0;

  return (
    <div className="space-y-5">
      {/* Search & Sort Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search input */}
        <div className="relative flex-1 sm:max-w-md">
          <input
            type="text"
            placeholder="Tìm theo tên môn, mã môn, mô tả..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-line bg-card py-2 pr-9 pl-9 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-hidden transition-colors shadow-2xs"
          />
          <svg
            className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-muted"
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
              className="absolute top-2.5 right-3 text-xs text-muted hover:text-foreground"
              title="Xóa tìm kiếm"
            >
              ✕
            </button>
          )}
        </div>

        {/* Sort dropdown and count info */}
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <span className="text-xs text-muted">
            Hiển thị <span className="font-semibold text-foreground">{filteredAndSortedSubjects.length}</span>/{subjects.length} môn
          </span>

          <div className="flex items-center gap-2">
            <label htmlFor="subject-sort" className="text-xs text-muted hidden md:inline">
              Sắp xếp:
            </label>
            <select
              id="subject-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="rounded-xl border border-line bg-card px-3 py-1.5 text-xs text-foreground focus:border-accent focus:outline-hidden shadow-2xs cursor-pointer"
            >
              <option value="name_asc">Tên (A → Z)</option>
              <option value="name_desc">Tên (Z → A)</option>
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
            </select>
          </div>
        </div>
      </div>

      {/* Empty State when filter yields 0 results */}
      {filteredAndSortedSubjects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-card/50 p-8 text-center">
          <p className="text-3xl mb-2">🔍</p>
          <h3 className="font-medium text-foreground">Không tìm thấy môn học nào</h3>
          <p className="mt-1 text-xs text-muted">
            Không có kết quả nào khớp với từ khóa &ldquo;<span className="text-foreground font-medium">{searchQuery}</span>&rdquo;.
          </p>
          {hasFilter && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-hover transition-colors"
            >
              Xóa bộ lọc tìm kiếm
            </button>
          )}
        </div>
      ) : (
        /* Subjects Grid */
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedSubjects.map((subject) => {
            const meta = getSubjectIcon(subject.code, subject.name);
            return (
              <li key={subject.id}>
                <Link
                  href={`/subjects/${subject.id}`}
                  className="group relative flex flex-col justify-between h-full rounded-2xl border border-line bg-card p-5 hover:border-accent hover:shadow-md transition-all duration-200"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-0.5 text-xs font-semibold ${meta.bgClass} ${meta.colorClass}`}
                      >
                        <span>{meta.icon}</span>
                        <span className="font-mono">{subject.code}</span>
                      </span>
                      <span className="text-[11px] text-muted group-hover:text-accent transition-colors">
                        Xem chi tiết →
                      </span>
                    </div>

                    <h2 className="mt-3 font-semibold text-base text-foreground group-hover:text-accent transition-colors">
                      {subject.name}
                    </h2>

                    {subject.description ? (
                      <p className="mt-1.5 line-clamp-2 text-xs text-muted leading-relaxed">
                        {subject.description}
                      </p>
                    ) : (
                      <p className="mt-1.5 text-xs text-muted/60 italic">
                        {isTeacher ? "Chưa có mô tả môn học." : "Môn học trong chương trình đào tạo."}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-line/60 flex items-center justify-between text-[11px] text-muted">
                    <span>
                      {new Date(subject.createdAt).toLocaleDateString("vi-VN", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}
                    </span>
                    <span className="font-medium text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                      {isTeacher ? "Quản lý đề" : "Luyện thi"}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
