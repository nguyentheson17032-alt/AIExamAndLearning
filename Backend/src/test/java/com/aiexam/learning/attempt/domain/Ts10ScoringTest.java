package com.aiexam.learning.attempt.domain;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

class Ts10ScoringTest {

    @Test
    void partTwoGroupScore_matchesOfficialScale() {
        assertThat(Ts10Scoring.partTwoGroupScore(0)).isEqualByComparingTo("0.00");
        assertThat(Ts10Scoring.partTwoGroupScore(1)).isEqualByComparingTo("0.10");
        assertThat(Ts10Scoring.partTwoGroupScore(2)).isEqualByComparingTo("0.25");
        assertThat(Ts10Scoring.partTwoGroupScore(3)).isEqualByComparingTo("0.50");
        assertThat(Ts10Scoring.partTwoGroupScore(4)).isEqualByComparingTo("1.00");
    }

    @Test
    void eloScore_dividesPointsByTen() {
        assertThat(Ts10Scoring.eloScore(new BigDecimal("8.50"), Ts10Scoring.MAX_SCORE))
                .isCloseTo(0.85, within(0.0001));
        assertThat(Ts10Scoring.eloScore(BigDecimal.ZERO, Ts10Scoring.MAX_SCORE)).isZero();
        assertThat(Ts10Scoring.eloScore(Ts10Scoring.MAX_SCORE, Ts10Scoring.MAX_SCORE)).isEqualTo(1.0);
        assertThat(Ts10Scoring.eloScore(new BigDecimal("2.45"), Ts10Scoring.MAX_SCORE))
                .isCloseTo(0.245, within(0.0001));
    }
}
