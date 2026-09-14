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
    }

    @Test
    void eloDelta_followsAwardedScore() {
        assertThat(Ts10Scoring.eloDelta(new BigDecimal("10.00"))).isEqualTo(10);
        assertThat(Ts10Scoring.eloDelta(new BigDecimal("9.00"))).isEqualTo(9);
        assertThat(Ts10Scoring.eloDelta(new BigDecimal("8.50"))).isEqualTo(8);
        assertThat(Ts10Scoring.eloDelta(new BigDecimal("7.25"))).isEqualTo(7);
        assertThat(Ts10Scoring.eloDelta(new BigDecimal("0.25"))).isZero();
        assertThat(Ts10Scoring.eloDelta(BigDecimal.ZERO)).isZero();
    }
}
