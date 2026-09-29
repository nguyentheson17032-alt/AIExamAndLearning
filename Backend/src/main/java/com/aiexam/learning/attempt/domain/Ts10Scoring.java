package com.aiexam.learning.attempt.domain;

import java.math.BigDecimal;
import java.math.RoundingMode;

public final class Ts10Scoring {

    public static final BigDecimal PART_I_POINTS = new BigDecimal("0.25");
    public static final BigDecimal PART_III_POINTS = new BigDecimal("0.50");
    public static final BigDecimal MAX_SCORE = new BigDecimal("10.00");

    private Ts10Scoring() {}

    public static BigDecimal partTwoGroupScore(int correctCount) {
        return switch (correctCount) {
            case 1 -> new BigDecimal("0.10");
            case 2 -> new BigDecimal("0.25");
            case 3 -> new BigDecimal("0.50");
            case 4 -> new BigDecimal("1.00");
            default -> BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        };
    }

    public static double eloScore(BigDecimal awarded, BigDecimal max) {
        BigDecimal divisor = max == null || max.signum() == 0 ? MAX_SCORE : max;
        return awarded.divide(divisor, 4, RoundingMode.HALF_UP).doubleValue();
    }
}
