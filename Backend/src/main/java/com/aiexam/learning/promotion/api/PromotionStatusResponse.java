package com.aiexam.learning.promotion.api;

import com.aiexam.learning.question.domain.Difficulty;
import com.aiexam.learning.user.domain.RankCode;

public record PromotionStatusResponse(
        RankCode currentRank,
        RankCode targetRank,
        int currentElo,
        int minEloThreshold,
        boolean eligible,
        Difficulty difficulty,
        int questionCount,
        int durationMinutes,
        double minPassingRatio,
        int requiredWins,
        int currentWins,
        boolean maxRankReached,
        String description
) {
    public static PromotionStatusResponse maxRank(RankCode currentRank, int currentElo) {
        return new PromotionStatusResponse(
                currentRank,
                null,
                currentElo,
                currentRank.minElo(),
                false,
                null,
                0,
                0,
                0.80,
                2,
                0,
                true,
                "Bạn đã đạt bậc xếp hạng cao nhất (DIAMOND)!"
        );
    }
}
