"use client";

import Link from "next/link";
import { useState, useEffect, useTransition } from "react";
import { evaluateMathAction, generateMathExercisesAction } from "@/lib/ai-actions";
import { MathText } from "@/components/math-text";
import type { MathCategory, MathDifficulty, MathEvaluateResult, MathExercise, Subject } from "@/lib/types";

interface AiTutorHubProps {
  initialSubjects?: Subject[];
}

export function AiTutorHub({ initialSubjects = [] }: AiTutorHubProps) {
  const subjectList: Subject[] = Array.isArray(initialSubjects)
    ? initialSubjects
    : Array.isArray((initialSubjects as { content?: Subject[] })?.content)
      ? (initialSubjects as { content?: Subject[] }).content || []
      : [];

  // ---------------- MATH & PHYSICS PRACTICE & SOLVER STATE ----------------
  const [subjectName, setSubjectName] = useState<string>(
    subjectList.length > 0 ? subjectList[0].name : "Toán"
  );
  const [category, setCategory] = useState<MathCategory>("all");
  const [difficulty, setDifficulty] = useState<MathDifficulty>("medium");
  const [questionCount, setQuestionCount] = useState<number>(3);
  const [eloRating, setEloRating] = useState<number>(1050);

  const isPhysics = /vật l[yí]|physics/i.test(subjectName);

  const [exercises, setExercises] = useState<MathExercise[]>([]);
  const [savedPaper, setSavedPaper] = useState<{
    id: string;
    title: string;
    paperSetId?: string;
    paperSetTitle?: string;
    subjectId?: string;
  } | null>(null);
  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [evalResult, setEvalResult] = useState<MathEvaluateResult | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [isGenPending, startGenTransition] = useTransition();
  const [isEvalPending, startEvalTransition] = useTransition();

  const currentExercise = exercises[currentExerciseIdx];

  const handleSubjectChange = (newSubject: string) => {
    setSubjectName(newSubject);
    setCategory("all");
  };

  const handleDifficultyChange = (newDiff: MathDifficulty) => {
    setDifficulty(newDiff);
    if (newDiff === "easy") setEloRating(900);
    else if (newDiff === "medium") setEloRating(1050);
    else if (newDiff === "hard") setEloRating(1250);
  };

  const getRankBadge = (elo: number) => {
    if (elo < 1000) return { label: "🥉 Đồng (Bronze)", color: "text-amber-700 bg-amber-100 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300" };
    if (elo < 1200) return { label: "🥈 Bạc (Silver)", color: "text-slate-700 bg-slate-100 border-slate-300 dark:bg-slate-800 dark:text-slate-300" };
    if (elo < 1400) return { label: "🥇 Vàng (Gold)", color: "text-yellow-700 bg-yellow-100 border-yellow-300 dark:bg-yellow-950/40 dark:text-yellow-300" };
    if (elo < 1600) return { label: "💎 Bạch kim (Platinum)", color: "text-cyan-700 bg-cyan-100 border-cyan-300 dark:bg-cyan-950/40 dark:text-cyan-300" };
    return { label: "👑 Kim cương (Diamond)", color: "text-purple-700 bg-purple-100 border-purple-300 dark:bg-purple-950/40 dark:text-purple-300" };
  };

  const handleGenerateExercises = () => {
    startGenTransition(async () => {
      setEvalResult(null);
      setShowSolution(false);
      setUserAnswer("");
      setSelectedOption(null);
      const res = await generateMathExercisesAction(category, difficulty, questionCount, eloRating, subjectName);
      if (res.exercises && res.exercises.length > 0) {
        setExercises(res.exercises);
        setCurrentExerciseIdx(0);
      }
      if (res.paperId) {
        const matched = subjectList.find((s) => s.name === subjectName);
        setSavedPaper({
          id: res.paperId,
          title: res.paperTitle || `Đề luyện tập AI - ${subjectName}`,
          paperSetId: res.paperSetId,
          paperSetTitle: res.paperSetTitle,
          subjectId: matched?.id,
        });
      }
    });
  };

  const handleEvaluate = (answerToTest?: string) => {
    if (!currentExercise) return;
    const ans = answerToTest !== undefined ? answerToTest : (selectedOption || userAnswer);
    if (!ans) return;

    startEvalTransition(async () => {
      const res = await evaluateMathAction(currentExercise, ans);
      if (res.result) {
        setEvalResult(res.result);
        setShowSolution(true);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-line pb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-white font-bold text-xs">
            AI
          </span>
          <h1 className="text-2xl font-bold tracking-tight">Luyện Tập & Chấm Điểm AI (Toán & Vật Lý)</h1>
        </div>
        <p className="text-sm text-muted">
          Sinh đề thi thông minh theo độ khó & mức Elo, hỗ trợ chuyên sâu môn Toán học & Vật lý với đầy đủ dạng câu hỏi, lời giải chi tiết và gợi ý từng bước.
        </p>
      </div>

      {/* ----------------- PRACTICE & EVALUATOR ----------------- */}
      <div className="space-y-6">
        {/* Enhanced Generation Controls */}
        <div className="rounded-xl border border-line bg-card p-5 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold">⚙️ Tùy Chỉnh Sinh Đề AI ({isPhysics ? "Vật Lý" : "Toán Học"})</span>
              <span className="text-xs text-muted">| Thiết lập các thông số đề thi theo mong muốn</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted font-medium">Xếp hạng dự kiến:</span>
              <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold ${getRankBadge(eloRating).color}`}>
                {getRankBadge(eloRating).label}
              </span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {/* 1. Môn học */}
            <div className="space-y-1.5">
              <label htmlFor="subjSelect" className="text-xs font-semibold text-muted">📚 Môn học:</label>
              <select
                id="subjSelect"
                value={subjectName}
                onChange={(e) => handleSubjectChange(e.target.value)}
                className="w-full rounded-lg border border-line bg-background px-3 py-2 text-xs focus:border-accent focus:outline-none"
              >
                {subjectList.length > 0 ? (
                  subjectList.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.code})
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Toán">Toán (MATH)</option>
                    <option value="Vật lý">Vật lý (PHYSICS)</option>
                  </>
                )}
              </select>
            </div>

            {/* 2. Chủ đề */}
            <div className="space-y-1.5">
              <label htmlFor="catSelect" className="text-xs font-semibold text-muted">🎯 Chuyên đề / Dạng bài:</label>
              <select
                id="catSelect"
                value={category}
                onChange={(e) => setCategory(e.target.value as MathCategory)}
                className="w-full rounded-lg border border-line bg-background px-3 py-2 text-xs focus:border-accent focus:outline-none"
              >
                {isPhysics ? (
                  <>
                    <option value="all">🌟 Tất cả dạng Vật lý</option>
                    <option value="mechanics">Cơ học & Động lực học</option>
                    <option value="oscillation_wave">Dao động & Sóng cơ</option>
                    <option value="circuits_electromagnetism">Điện học & Mạch RLC</option>
                    <option value="optics">Quang học & Thấu kính</option>
                    <option value="thermodynamics">Nhiệt học & Khí lý tưởng</option>
                    <option value="nuclear_quantum">Lượng tử & Vật lý hạt nhân</option>
                  </>
                ) : (
                  <>
                    <option value="all">🌟 Tất cả dạng Toán</option>
                    <option value="linear">Phương trình bậc nhất</option>
                    <option value="quadratic">Phương trình bậc hai</option>
                    <option value="system">Hệ 2 phương trình bậc nhất</option>
                    <option value="word_problem">Toán thực tế / Lời văn</option>
                    <option value="ai_challenge">AI Model Regression</option>
                  </>
                )}
              </select>
            </div>

            {/* 3. Độ khó */}
            <div className="space-y-1.5">
              <label htmlFor="diffSelect" className="text-xs font-semibold text-muted">⚡ Độ khó:</label>
              <select
                id="diffSelect"
                value={difficulty}
                onChange={(e) => handleDifficultyChange(e.target.value as MathDifficulty)}
                className="w-full rounded-lg border border-line bg-background px-3 py-2 text-xs focus:border-accent focus:outline-none"
              >
                <option value="easy">Cơ bản (Easy)</option>
                <option value="medium">Trung bình (Medium)</option>
                <option value="hard">Nâng cao (Hard)</option>
              </select>
            </div>

            {/* 4. Số câu */}
            <div className="space-y-1.5">
              <label htmlFor="countSelect" className="text-xs font-semibold text-muted">📝 Số lượng câu:</label>
              <select
                id="countSelect"
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full rounded-lg border border-line bg-background px-3 py-2 text-xs focus:border-accent focus:outline-none"
              >
                <option value={3}>3 câu (Luyện nhanh)</option>
                <option value={5}>5 câu (Tiêu chuẩn)</option>
                <option value={10}>10 câu (Đầy đủ)</option>
                <option value={15}>15 câu (Đề thi thử)</option>
                <option value={20}>20 câu (Toàn diện)</option>
              </select>
            </div>

            {/* 5. Mức Elo */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="eloInput" className="text-xs font-semibold text-muted">⭐ Mức Elo:</label>
                <span className="text-[11px] font-bold text-accent">{eloRating} Elo</span>
              </div>
              <input
                id="eloInput"
                type="number"
                min={800}
                max={2000}
                step={50}
                value={eloRating}
                onChange={(e) => setEloRating(Math.max(800, Math.min(2000, Number(e.target.value) || 1000)))}
                className="w-full rounded-lg border border-line bg-background px-3 py-2 text-xs focus:border-accent focus:outline-none font-bold text-accent"
              />
            </div>
          </div>

          {/* Generate Action Button */}
          <div className="flex items-center justify-between pt-2 border-t border-line/60">
            <span className="text-xs text-muted">
              Đang cấu hình: <strong className="text-foreground">{subjectName}</strong> • <strong className="text-foreground">{questionCount} câu</strong> • Độ khó <strong className="text-foreground">{difficulty.toUpperCase()}</strong> ({eloRating} Elo)
            </span>
            <button
              type="button"
              onClick={handleGenerateExercises}
              disabled={isGenPending}
              className="flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-accent-hover transition disabled:opacity-50 cursor-pointer"
            >
              {isGenPending ? (
                <>
                  <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  AI Đang Sinh {questionCount} Câu...
                </>
              ) : (
                <>🔄 Sinh {questionCount} Câu Mới</>
              )}
            </button>
          </div>
        </div>

        {/* Saved Paper Notification Banner */}
        {savedPaper && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-800 dark:text-emerald-300">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold">✅ Đã tạo bộ đề & đề thi AI:</span>
              <span className="font-medium">{savedPaper.title}</span>
              {savedPaper.paperSetTitle && (
                <span className="rounded bg-emerald-600/15 px-2 py-0.5 text-[11px] font-bold text-emerald-800 dark:text-emerald-200">
                  📁 {savedPaper.paperSetTitle}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {savedPaper.subjectId && (
                <Link
                  href={`/subjects/${savedPaper.subjectId}`}
                  className="font-bold underline hover:text-emerald-600 transition"
                >
                  Xem trong Bộ đề Môn học ↗
                </Link>
              )}
              <Link
                href={`/papers/${savedPaper.id}`}
                className="font-bold underline hover:text-emerald-600 transition"
              >
                Làm đề thi chính thức ↗
              </Link>
              <Link
                href="/subjects"
                className="rounded-md border border-emerald-600/40 px-2.5 py-1 font-semibold hover:bg-emerald-600 hover:text-white transition"
              >
                Xem danh sách Môn học ↗
              </Link>
            </div>
          </div>
        )}

        {/* Current Exercise Display */}
        {currentExercise ? (
          <div className="rounded-xl border border-line bg-card p-6 space-y-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-accent/15 px-2.5 py-1 text-xs font-bold text-accent">
                  {currentExercise.category_name}
                </span>
                <span className="rounded-md border border-line bg-background px-2.5 py-1 text-xs font-medium text-muted">
                  {currentExercise.subject_name || subjectName}
                </span>
                <span className="rounded-md border border-line bg-background px-2.5 py-1 text-xs font-bold text-muted">
                  Độ khó: {currentExercise.difficulty?.toUpperCase()}
                </span>
                <span className={`rounded-md border px-2 py-0.5 text-xs font-bold ${getRankBadge(currentExercise.elo || eloRating).color}`}>
                  ⭐ {currentExercise.elo || eloRating} Elo
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted mr-1">Câu:</span>
                {exercises.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setCurrentExerciseIdx(idx);
                      setEvalResult(null);
                      setShowSolution(false);
                      setUserAnswer("");
                      setSelectedOption(null);
                    }}
                    className={`h-7 w-7 rounded-md text-xs font-bold transition cursor-pointer ${idx === currentExerciseIdx
                      ? "bg-accent text-white shadow-sm"
                      : "border border-line text-muted hover:border-accent"
                      }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Stem / Problem text with KaTeX Math Rendering */}
            <div className="rounded-lg border border-line bg-background/50 p-5">
              <div className="font-semibold text-base leading-relaxed">
                <MathText text={currentExercise.question} />
              </div>
            </div>

            {/* Multiple Choice Options or Text Input */}
            {currentExercise.options && currentExercise.options.length > 0 ? (
              <div className="space-y-2.5">
                <label className="text-xs font-medium text-muted">Chọn phương án trả lời đúng:</label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {currentExercise.options.map((opt, i) => {
                    const label = String.fromCharCode(65 + i);
                    const isSelected = selectedOption === label || selectedOption === opt;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setSelectedOption(label);
                          handleEvaluate(label);
                        }}
                        className={`flex items-center gap-3 rounded-xl border p-4 text-left text-sm transition cursor-pointer ${isSelected
                          ? "border-accent bg-accent/10 font-semibold text-accent"
                          : "border-line bg-card hover:border-accent"
                          }`}
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-line font-bold text-xs">
                          {label}
                        </span>
                        <span><MathText text={opt} /></span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <label htmlFor="userAnsInput" className="text-xs font-medium text-muted">Nhập kết quả hoặc tập nghiệm:</label>
                <div className="flex gap-2">
                  <input
                    id="userAnsInput"
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Ví dụ: x = 2 hoặc S = {1, 3} hoặc Vô nghiệm..."
                    className="flex-1 rounded-lg border border-line bg-background px-4 py-2 text-sm focus:border-accent focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleEvaluate()}
                    disabled={isEvalPending || !userAnswer.trim()}
                    className="rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-50 transition cursor-pointer"
                  >
                    {isEvalPending ? "Đang chấm..." : "Chấm Điểm"}
                  </button>
                </div>
              </div>
            )}

            {/* Evaluation Result Alert */}
            {evalResult && (
              <div
                className={`rounded-xl border p-4 text-sm ${evalResult.is_correct
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                  }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span><MathText text={evalResult.feedback} /></span>
                  <span className="rounded-md bg-card px-2.5 py-0.5 text-xs font-extrabold border border-line">
                    Điểm: {evalResult.score}/100
                  </span>
                </div>
              </div>
            )}

            {/* Hints & Solution Drawer */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSolution((prev) => !prev)}
                className="rounded-lg border border-line px-4 py-2 text-xs font-medium hover:border-accent transition cursor-pointer"
              >
                {showSolution ? "Ẩn lời giải chi tiết" : "📖 Xem lời giải chi tiết từng bước"}
              </button>
            </div>

            {/* Detailed Solution Block */}
            {showSolution && (
              <div className="space-y-4 rounded-xl border border-line bg-background/70 p-5 text-sm">
                <div>
                  <h4 className="font-bold text-accent">Lời Giải Từng Bước Chuẩn Giáo Khoa:</h4>
                  <div className="mt-2 text-muted leading-relaxed text-xs">
                    <MathText text={currentExercise.solution} />
                  </div>
                </div>
                {currentExercise.hints && currentExercise.hints.length > 0 && (
                  <div className="border-t border-line pt-3">
                    <h5 className="font-semibold text-xs text-muted">Gợi ý tư duy:</h5>
                    <ul className="mt-1 list-disc list-inside text-xs text-muted space-y-1">
                      {currentExercise.hints.map((h, i) => (
                        <li key={i}><MathText text={h} /></li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-line bg-card p-12 text-center text-muted">
            <p className="text-base font-semibold text-foreground">Chưa có bài tập nào được tạo</p>
            <p className="mt-1 text-xs">
              Hãy chọn các thông số (Môn học, Chủ đề, Độ khó, Số lượng câu, Mức Elo) ở trên và bấm nút <strong>Sinh Đề Mới</strong> để bắt đầu luyện tập!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
