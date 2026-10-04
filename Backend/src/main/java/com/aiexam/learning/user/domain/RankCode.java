package com.aiexam.learning.user.domain;

import com.aiexam.learning.question.domain.Difficulty;

public enum RankCode {
    BRONZE,
    SILVER,
    GOLD,
    PLATINUM,
    DIAMOND;

    public record PromotionRequirement(
            RankCode fromRank,
            RankCode targetRank,
            int minEloThreshold,
            Difficulty difficulty,
            int questionCount,
            int durationMinutes,
            double minPassingRatio,
            int requiredWins
    ) {}

    public static RankCode fromElo(int eloRating) {
        if (eloRating < 1000) {
            return BRONZE;
        }
        if (eloRating < 1200) {
            return SILVER;
        }
        if (eloRating < 1400) {
            return GOLD;
        }
        if (eloRating < 1600) {
            return PLATINUM;
        }
        return DIAMOND;
    }

    public int minElo() {
        return switch (this) {
            case BRONZE -> 0;
            case SILVER -> 1000;
            case GOLD -> 1200;
            case PLATINUM -> 1400;
            case DIAMOND -> 1600;
        };
    }

    public RankCode nextRank() {
        return switch (this) {
            case BRONZE -> SILVER;
            case SILVER -> GOLD;
            case GOLD -> PLATINUM;
            case PLATINUM -> DIAMOND;
            case DIAMOND -> null;
        };
    }

    public PromotionRequirement promotionRequirement() {
        RankCode next = nextRank();
        if (next == null) {
            return null;
        }
        return switch (this) {
            case BRONZE -> new PromotionRequirement(BRONZE, SILVER, 1000, Difficulty.BEGINNER, 20, 20, 0.80, 2);
            case SILVER -> new PromotionRequirement(SILVER, GOLD, 1200, Difficulty.INTERMEDIATE, 20, 25, 0.80, 2);
            case GOLD -> new PromotionRequirement(GOLD, PLATINUM, 1400, Difficulty.ADVANCED, 15, 30, 0.80, 2);
            case PLATINUM -> new PromotionRequirement(PLATINUM, DIAMOND, 1600, Difficulty.ADVANCED, 20, 40, 0.80, 2);
            case DIAMOND -> null;
        };
    }
}
