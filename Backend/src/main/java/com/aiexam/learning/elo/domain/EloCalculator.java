package com.aiexam.learning.elo.domain;

import com.aiexam.learning.question.domain.Difficulty;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public final class EloCalculator {

    public static final int MIN_ELO = 100;
    public static final int MIN_QUESTION_ELO = 600;
    public static final int MAX_QUESTION_ELO = 2200;
    public static final int ITEM_K_FACTOR = 4;

    // Difficulty coefficients: Easy * 0.3, Medium * 0.4, Hard * 0.5
    public static final double EASY_COEFFICIENT = 0.3;
    public static final double MEDIUM_COEFFICIENT = 0.4;
    public static final double HARD_COEFFICIENT = 0.5;

    private EloCalculator() {}

    public record ItemInput(
            UUID questionId,
            int questionElo,
            Difficulty difficulty,
            BigDecimal maxPoints,
            BigDecimal earnedScore
    ) {
        public ItemInput(UUID questionId, int questionElo, BigDecimal maxPoints, BigDecimal earnedScore) {
            this(questionId, questionElo, null, maxPoints, earnedScore);
        }
    }

    public record AdvancedCalculationRequest(
            int userElo,
            int paperElo,
            BigDecimal totalScore,
            BigDecimal maxScore,
            List<ItemInput> items,
            long timeSpentSeconds,
            int paperDurationMinutes,
            long previousAttemptsCount,
            int recentStreaks,
            int defaultKFactor
    ) {}

    public record AdvancedCalculationResult(
            int eloBefore,
            int eloAfter,
            int eloDelta,
            double rawEloGained,
            int dynamicKFactor,
            double expectedScore,
            double actualScoreRatio,
            double streakMultiplier,
            double timeMultiplier,
            Map<UUID, Integer> updatedQuestionElos
    ) {}

    public static double difficultyCoefficient(Difficulty difficulty, int fallbackElo) {
        if (difficulty != null) {
            return switch (difficulty) {
                case BEGINNER -> EASY_COEFFICIENT;
                case INTERMEDIATE -> MEDIUM_COEFFICIENT;
                case ADVANCED, EXPERT -> HARD_COEFFICIENT;
            };
        }
        if (fallbackElo < 1000) {
            return EASY_COEFFICIENT;
        } else if (fallbackElo < 1300) {
            return MEDIUM_COEFFICIENT;
        } else {
            return HARD_COEFFICIENT;
        }
    }

    public static double levelMatchMultiplier(int userElo, int targetElo) {
        if (targetElo >= userElo) {
            return 1.0;
        }
        double exponent = (userElo - targetElo) / 400.0;
        double match = 2.0 / (1.0 + Math.pow(10.0, exponent));
        return Math.max(0.05, match);
    }

    public static int paperRating(int targetEloMin, int targetEloMax) {
        return (int) Math.round((targetEloMin + (double) targetEloMax) / 2.0);
    }

    public static int nextRating(int userElo, int opponentElo, double score, int kFactor) {
        double expected = expectedScore(userElo, opponentElo);
        return (int) Math.round(userElo + kFactor * (score - expected));
    }

    public static double expectedScore(int userElo, int opponentElo) {
        return 1.0 / (1.0 + Math.pow(10.0, (opponentElo - userElo) / 400.0));
    }

    public static int resolveDynamicKFactor(long previousAttemptsCount, int userElo, int fallbackK) {
        if (previousAttemptsCount < 5) {
            return 40; // Placement phase: phân hạng nhanh cho người mới
        }
        if (previousAttemptsCount < 15) {
            return 32; // Giai đoạn leo rank tích cực
        }
        if (userElo < 1200) {
            return 28;
        }
        if (userElo < 1500) {
            return fallbackK > 0 ? fallbackK : 24;
        }
        return 18; // Rank cao (Kim cương/Cao thủ): duy trì tính ổn định cao
    }

    public static AdvancedCalculationResult calculateAdvanced(AdvancedCalculationRequest req) {
        int userElo = req.userElo();
        int paperElo = req.paperElo();
        List<ItemInput> items = req.items() != null ? req.items() : List.of();

        double totalMaxPoints = 0.0;
        for (ItemInput it : items) {
            if (it.maxPoints() != null && it.maxPoints().signum() > 0) {
                totalMaxPoints += it.maxPoints().doubleValue();
            }
        }

        double expectedScoreSum = 0.0;
        double actualScoreRatioSum = 0.0;
        double rawEloGained = 0.0;
        Map<UUID, Integer> updatedQuestionElos = new HashMap<>();

        if (items.isEmpty() || totalMaxPoints <= 0) {
            // Fallback: tính theo tỷ lệ điểm và mức độ của đề
            expectedScoreSum = expectedScore(userElo, paperElo);
            double total = req.totalScore() != null ? req.totalScore().doubleValue() : 0.0;
            double max = req.maxScore() != null && req.maxScore().signum() > 0 ? req.maxScore().doubleValue() : 10.0;
            actualScoreRatioSum = Math.max(0.0, Math.min(1.0, total / max));
            double coeff = difficultyCoefficient(null, paperElo);
            double matchMultiplier = levelMatchMultiplier(userElo, paperElo);
            rawEloGained = actualScoreRatioSum * coeff * matchMultiplier * 20.0;
        } else {
            // 1. Tính toán Elo cộng theo từng câu: Số câu đúng * Hệ số độ khó * Hệ số tương xứng trình độ
            for (ItemInput item : items) {
                double maxPts = item.maxPoints() != null && item.maxPoints().signum() > 0 ? item.maxPoints().doubleValue() : 1.0;
                double earned = item.earnedScore() != null ? item.earnedScore().doubleValue() : 0.0;
                double itemRatio = Math.max(0.0, Math.min(1.0, earned / maxPts));
                double weight = maxPts / totalMaxPoints;

                int qElo = item.questionElo() > 0 ? item.questionElo() : paperElo;
                double coeff = difficultyCoefficient(item.difficulty(), qElo);
                double matchMultiplier = levelMatchMultiplier(userElo, qElo);
                rawEloGained += itemRatio * coeff * matchMultiplier;

                double itemExpected = expectedScore(userElo, qElo);
                expectedScoreSum += weight * itemExpected;
                actualScoreRatioSum += weight * itemRatio;

                // 2. Hiệu chỉnh 2 chiều độ khó câu hỏi (Dynamic Item Calibration)
                if (item.questionId() != null) {
                    double qExpected = 1.0 - itemExpected;
                    double qActual = 1.0 - itemRatio;
                    int deltaQ = (int) Math.round(ITEM_K_FACTOR * (qActual - qExpected));
                    int newQElo = Math.max(MIN_QUESTION_ELO, Math.min(MAX_QUESTION_ELO, qElo + deltaQ));
                    updatedQuestionElos.put(item.questionId(), newQElo);
                }
            }
        }

        // 3. Dynamic K-Factor
        int dynamicK = resolveDynamicKFactor(req.previousAttemptsCount(), userElo, req.defaultKFactor());

        // 4. Streak / Performance Multiplier
        double streakMultiplier = 1.0;
        if (actualScoreRatioSum >= 0.80 && req.recentStreaks() > 0) {
            streakMultiplier = 1.0 + Math.min(0.25, 0.05 * req.recentStreaks());
        }

        // 5. Time-Efficiency Multiplier (Thưởng giải nhanh chính xác)
        double timeMultiplier = 1.0;
        if (actualScoreRatioSum >= 0.70 && req.paperDurationMinutes() > 0) {
            double targetSeconds = req.paperDurationMinutes() * 60.0;
            double timeRatio = (double) req.timeSpentSeconds() / targetSeconds;
            if (timeRatio >= 0.30 && timeRatio <= 0.80) {
                timeMultiplier = 1.0 + 0.15 * (1.0 - ((timeRatio - 0.30) / 0.50));
            }
        }

        // 6. Tổng hợp biến thiên Elo: rawEloGained * Multipliers
        double finalDelta = rawEloGained * streakMultiplier * timeMultiplier;

        int eloAfter = Math.max(MIN_ELO, (int) Math.round(userElo + finalDelta));
        int eloDelta = eloAfter - userElo;

        return new AdvancedCalculationResult(
                userElo,
                eloAfter,
                eloDelta,
                rawEloGained,
                dynamicK,
                expectedScoreSum,
                actualScoreRatioSum,
                streakMultiplier,
                timeMultiplier,
                updatedQuestionElos
        );
    }
}
