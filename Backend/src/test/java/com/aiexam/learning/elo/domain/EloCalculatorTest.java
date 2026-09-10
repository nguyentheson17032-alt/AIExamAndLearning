package com.aiexam.learning.elo.domain;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class EloCalculatorTest {

    @Test
    void nextRating_whenUserWinsAgainstEqualOpponent_increasesRating() {
        int updated = EloCalculator.nextRating(1000, 1000, 1.0, 24);
        assertThat(updated).isGreaterThan(1000);
    }

    @Test
    void nextRating_whenUserLosesAgainstEqualOpponent_decreasesRating() {
        int updated = EloCalculator.nextRating(1000, 1000, 0.0, 24);
        assertThat(updated).isLessThan(1000);
    }

    @Test
    void expectedScore_whenRatingsEqual_isHalf() {
        assertThat(EloCalculator.expectedScore(1200, 1200)).isEqualTo(0.5);
    }
}
