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

    @Test
    void paperRating_usesTargetMidpoint() {
        assertThat(EloCalculator.paperRating(1000, 1400)).isEqualTo(1200);
        assertThat(EloCalculator.paperRating(1400, 1800)).isEqualTo(1600);
    }

    @Test
    void nextRating_halfScoreAgainstEqualPaper_staysPut() {
        assertThat(EloCalculator.nextRating(1244, 1244, 0.5, 24)).isEqualTo(1244);
    }

    @Test
    void nextRating_perfectAndZeroAgainstEqualPaper_swingByTwelve() {
        assertThat(EloCalculator.nextRating(1000, 1000, 1.0, 24)).isEqualTo(1012);
        assertThat(EloCalculator.nextRating(1000, 1000, 0.0, 24)).isEqualTo(988);
    }

    @Test
    void nextRating_lowScoreUsesPaperTargetNotQuestionAverage() {
        assertThat(EloCalculator.nextRating(1244, 1200, 0.245, 24)).isEqualTo(1236);
        assertThat(EloCalculator.nextRating(1244, 1244, 0.245, 24)).isEqualTo(1238);
        assertThat(EloCalculator.nextRating(1244, 1600, 0.245, 24)).isEqualTo(1247);
    }
}
