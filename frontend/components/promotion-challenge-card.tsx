"use client";

import { startPromotionExamAction } from "@/lib/promotion-actions";
import type { PromotionStatusResponse, RankCode } from "@/lib/types";
import { useState } from "react";

const RANK_LABELS: Record<RankCode, { name: string; emoji: string; color: string; badge: string }> = {
  BRONZE: { name: "Đồng (Bronze)", emoji: "🥉", color: "text-amber-600", badge: "bg-amber-500/10 text-amber-600 border-amber-500/30" },
  SILVER: { name: "Bạc (Silver)", emoji: "🥈", color: "text-slate-400", badge: "bg-slate-400/10 text-slate-400 border-slate-400/30" },
  GOLD: { name: "Vàng (Gold)", emoji: "🥇", color: "text-yellow-500", badge: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30" },
  PLATINUM: { name: "Bạch Kim (Platinum)", emoji: "💎", color: "text-cyan-400", badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30" },
  DIAMOND: { name: "Kim Cương (Diamond)", emoji: "👑", color: "text-purple-400", badge: "bg-purple-500/10 text-purple-400 border-purple-500/30" },
};

export function PromotionChallengeCard({ status }: { status: PromotionStatusResponse | null }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!status) {
    return null;
  }

  const currentInfo = RANK_LABELS[status.currentRank] || { name: status.currentRank, emoji: "⭐", color: "text-foreground", badge: "border-line" };
  const targetInfo = status.targetRank ? RANK_LABELS[status.targetRank] : null;

  async function handleStart() {
    setLoading(true);
    setError(null);
    const res = await startPromotionExamAction();
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    }
  }

  if (status.maxRankReached) {
    return (
      <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-500/10 via-background to-cyan-500/10 p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-3xl">👑</span>
          <div>
            <h3 className="text-lg font-bold text-purple-400">Bậc Xếp Hạng Tối Thượng</h3>
            <p className="text-xs text-muted">Bạn đã đạt thứ hạng cao nhất: <strong className="text-foreground">DIAMOND ({status.currentElo} Elo)</strong>!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-card p-6 shadow-sm">
      <div className="absolute right-0 top-0 -mr-12 -mt-12 h-36 w-36 rounded-full bg-accent/5 blur-3xl" />
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">⚔️</span>
            <h3 className="text-base font-bold text-foreground">Thử Thách Thăng Hạng Rank</h3>
            {status.eligible ? (
              <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-500">
                ✨ Sẵn sàng thăng hạng
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full border border-line bg-background px-2.5 py-0.5 text-xs font-medium text-muted">
                🔒 Cần {status.minEloThreshold} Elo
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-muted">
            {status.description}
          </p>
        </div>

        {/* Rank Path */}
        {targetInfo && (
          <div className="flex items-center gap-2 rounded-xl border border-line bg-background px-3 py-2 text-xs font-semibold">
            <span className={currentInfo.color}>{currentInfo.emoji} {currentInfo.name}</span>
            <span className="text-muted">➔</span>
            <span className={`${targetInfo.color} font-bold`}>{targetInfo.emoji} {targetInfo.name}</span>
          </div>
        )}
      </div>

      {/* Progress & Specifications */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {/* Tiêu chí bài thi */}
        <div className="rounded-xl border border-line bg-background/60 p-4">
          <p className="text-xs font-semibold text-muted">📋 Cấu trúc đề thi thăng hạng:</p>
          <ul className="mt-2 space-y-1 text-xs text-foreground">
            <li>• Độ khó: <strong className="text-accent">{status.difficulty}</strong></li>
            <li>• Quy mô: <strong>{status.questionCount} câu hỏi</strong> hỗn hợp</li>
            <li>• Thời gian làm bài: <strong>{status.durationMinutes} phút</strong></li>
            <li>• Tiêu chuẩn đạt: <strong>Đúng trên {Math.round(status.minPassingRatio * 100)}% số câu</strong></li>
          </ul>
        </div>

        {/* Tiến độ thắng */}
        <div className="flex flex-col justify-between rounded-xl border border-line bg-background/60 p-4">
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-muted">Tiến độ chuỗi thăng hạng:</span>
              <span className="font-bold text-accent">{status.currentWins} / {status.requiredWins} bài đạt</span>
            </div>
            <div className="mt-3 flex gap-2">
              {Array.from({ length: status.requiredWins }).map((_, i) => (
                <div
                  key={i}
                  className={`flex flex-1 items-center justify-center rounded-lg border py-2 text-xs font-bold transition-all ${
                    i < status.currentWins
                      ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-500"
                      : "border-line bg-background text-muted"
                  }`}
                >
                  {i < status.currentWins ? "✓ Bài " + (i + 1) + " Đạt" : "Bài " + (i + 1) + " (Chưa)"}
                </div>
              ))}
            </div>
          </div>

          {!status.eligible && (
            <p className="mt-3 text-[11px] text-amber-500/90">
              💡 Bạn đang có <strong>{status.currentElo} Elo</strong>. Cần thêm <strong>{Math.max(0, status.minEloThreshold - status.currentElo)} Elo</strong> nữa để kích hoạt bài thi thăng hạng.
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-500">
          {error}
        </div>
      )}

      {/* Action Button */}
      {status.eligible && (
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={handleStart}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-xs font-bold text-accent-foreground shadow-sm transition-all hover:opacity-90 disabled:opacity-50"
          >
            {loading ? (
              <span>Đang tạo đề thi thăng hạng...</span>
            ) : (
              <>
                <span>🔥 Bắt đầu bài thi thăng hạng (Bài {status.currentWins + 1}/{status.requiredWins})</span>
                <span>➔</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
