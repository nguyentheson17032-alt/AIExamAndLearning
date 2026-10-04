"use client";

import { useActionState, useState } from "react";
import { generateMathToBankAction, type AiFormState } from "@/lib/ai-actions";
import type { Subject, Topic } from "@/lib/types";

export function AiMathBankGenerator({
  subjects,
  topicsBySubject,
}: {
  subjects: Subject[];
  topicsBySubject?: Record<string, Topic[]>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || "");
  const [state, formAction, isPending] = useActionState<AiFormState, FormData>(
    generateMathToBankAction,
    null,
  );

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);
  const isPhysics = selectedSubject
    ? /vật l[yí]|physics/i.test(selectedSubject.name) || /phys/i.test(selectedSubject.code)
    : false;

  const currentTopics = topicsBySubject?.[selectedSubjectId] || [];

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-lg border border-accent bg-accent/10 px-3.5 py-2 text-sm font-semibold text-accent hover:bg-accent hover:text-white transition flex items-center gap-2"
      >
        <span>⚡ AI Sinh Câu Hỏi Vào Kho (Toán & Vật Lý)</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-line bg-card p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <h3 className="text-lg font-bold">
                  Sinh Câu Hỏi Tự Động (AI Engine - {isPhysics ? "Vật Lý" : "Toán Học"})
                </h3>
                <p className="text-xs text-muted">
                  Sử dụng mô hình AI thông minh để tạo câu hỏi chuẩn hóa kèm lời giải chi tiết vào Ngân hàng.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-muted hover:text-foreground text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            {state?.error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-500">
                {state.error}
              </div>
            )}
            {state?.message && (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-600">
                {state.message}
              </div>
            )}

            <form action={formAction} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted mb-1">Môn học</label>
                <select
                  name="subjectId"
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full rounded-lg border border-line bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none"
                  required
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              {currentTopics.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Chủ đề (Topic)</label>
                  <select
                    name="topicId"
                    className="w-full rounded-lg border border-line bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none"
                  >
                    <option value="">-- Chọn chủ đề (tùy chọn) --</option>
                    {currentTopics.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Dạng bài tập</label>
                  <select
                    name="category"
                    className="w-full rounded-lg border border-line bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none"
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
                        <option value="physics_true_false">Trắc nghiệm Đúng / Sai (Phần II)</option>
                        <option value="physics_short_answer">Trắc nghiệm Trả lời ngắn (Phần III)</option>
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

                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Độ khó</label>
                  <select
                    name="difficulty"
                    defaultValue="medium"
                    className="w-full rounded-lg border border-line bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none"
                  >
                    <option value="easy">Cơ bản (Easy - 900 Elo)</option>
                    <option value="medium">Trung bình (Medium - 1050 Elo)</option>
                    <option value="hard">Nâng cao (Hard - 1250 Elo)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1">Số lượng câu hỏi</label>
                <input
                  type="number"
                  name="count"
                  min="1"
                  max="10"
                  defaultValue="3"
                  className="w-full rounded-lg border border-line bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg border border-line px-4 py-2 text-sm text-muted hover:text-foreground"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-white hover:bg-accent-hover transition disabled:opacity-50"
                >
                  {isPending ? "Đang sinh câu hỏi..." : "Sinh & Thêm Vào Kho"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
