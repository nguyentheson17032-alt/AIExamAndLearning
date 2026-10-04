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

    @Test
    void resolveDynamicKFactor_highKForNewcomers_andLowerForVeterans() {
        assertThat(EloCalculator.resolveDynamicKFactor(2, 1000, 24)).isEqualTo(40);
        assertThat(EloCalculator.resolveDynamicKFactor(8, 1100, 24)).isEqualTo(32);
        assertThat(EloCalculator.resolveDynamicKFactor(20, 1150, 24)).isEqualTo(28);
        assertThat(EloCalculator.resolveDynamicKFactor(20, 1350, 24)).isEqualTo(24);
        assertThat(EloCalculator.resolveDynamicKFactor(20, 1650, 24)).isEqualTo(18);
    }

    @Test
    void calculateAdvanced_perItemAndCalibratesQuestions() {
        java.util.UUID qEasy = java.util.UUID.randomUUID();
        java.util.UUID qHard = java.util.UUID.randomUUID();

        var items = java.util.List.of(
                new EloCalculator.ItemInput(qEasy, 900, java.math.BigDecimal.valueOf(5.0), java.math.BigDecimal.valueOf(5.0)),
                new EloCalculator.ItemInput(qHard, 1500, java.math.BigDecimal.valueOf(5.0), java.math.BigDecimal.valueOf(5.0))
        );

        var req = new EloCalculator.AdvancedCalculationRequest(
                1200,
                1200,
                java.math.BigDecimal.valueOf(10.0),
                java.math.BigDecimal.valueOf(10.0),
                items,
                1800, // 30 mins
                45,   // 45 mins duration -> time ratio ~ 0.66
                10,   // previous attempts
                3,    // 3 streak
                24
        );

        var result = EloCalculator.calculateAdvanced(req);

        assertThat(result.eloAfter()).isGreaterThan(1200);
        assertThat(result.streakMultiplier()).isGreaterThan(1.0);
        assertThat(result.timeMultiplier()).isGreaterThan(1.0);
        assertThat(result.updatedQuestionElos()).containsKey(qEasy);
        assertThat(result.updatedQuestionElos()).containsKey(qHard);
        // Because user got both right, question ratings should decrease
        assertThat(result.updatedQuestionElos().get(qHard)).isLessThanOrEqualTo(1500);
    }

    @Test
    void calculateAdvanced_easy3Questions_gainsPointNineRawElo() {
        var items = java.util.List.of(
                new EloCalculator.ItemInput(java.util.UUID.randomUUID(), 900, com.aiexam.learning.question.domain.Difficulty.BEGINNER, java.math.BigDecimal.ONE, java.math.BigDecimal.ONE),
                new EloCalculator.ItemInput(java.util.UUID.randomUUID(), 900, com.aiexam.learning.question.domain.Difficulty.BEGINNER, java.math.BigDecimal.ONE, java.math.BigDecimal.ONE),
                new EloCalculator.ItemInput(java.util.UUID.randomUUID(), 900, com.aiexam.learning.question.domain.Difficulty.BEGINNER, java.math.BigDecimal.ONE, java.math.BigDecimal.ONE)
        );

        var req = new EloCalculator.AdvancedCalculationRequest(
                900,
                900,
                java.math.BigDecimal.valueOf(3.0),
                java.math.BigDecimal.valueOf(3.0),
                items,
                600, // standard time
                10,
                0,
                0, // no streak
                24
        );

        var result = EloCalculator.calculateAdvanced(req);
        // 3 questions * 0.3 = 0.9 raw Elo gain for commensurate user (Elo <= 900)
        assertThat(result.rawEloGained()).isEqualTo(0.9, org.assertj.core.data.Offset.offset(0.001));
    }

    @Test
    void calculateAdvanced_hard20Questions_gainsTenRawElo() {
        java.util.List<EloCalculator.ItemInput> items = new java.util.ArrayList<>();
        for (int i = 0; i < 20; i++) {
            items.add(new EloCalculator.ItemInput(
                    java.util.UUID.randomUUID(),
                    1400,
                    com.aiexam.learning.question.domain.Difficulty.ADVANCED,
                    java.math.BigDecimal.ONE,
                    java.math.BigDecimal.ONE
            ));
        }

        var req = new EloCalculator.AdvancedCalculationRequest(
                1000,
                1400,
                java.math.BigDecimal.valueOf(20.0),
                java.math.BigDecimal.valueOf(20.0),
                items,
                3600,
                60,
                0,
                0,
                24
        );

        var result = EloCalculator.calculateAdvanced(req);
        // 20 questions * 0.5 = 10.0 raw Elo gain (user Elo 1000 <= question Elo 1400)
        assertThat(result.rawEloGained()).isEqualTo(10.0, org.assertj.core.data.Offset.offset(0.001));
    }

    @Test
    void calculateAdvanced_medium20Questions_gainsEightRawElo() {
        java.util.List<EloCalculator.ItemInput> items = new java.util.ArrayList<>();
        for (int i = 0; i < 20; i++) {
            items.add(new EloCalculator.ItemInput(
                    java.util.UUID.randomUUID(),
                    1100,
                    com.aiexam.learning.question.domain.Difficulty.INTERMEDIATE,
                    java.math.BigDecimal.ONE,
                    java.math.BigDecimal.ONE
            ));
        }

        var req = new EloCalculator.AdvancedCalculationRequest(
                1000,
                1100,
                java.math.BigDecimal.valueOf(20.0),
                java.math.BigDecimal.valueOf(20.0),
                items,
                3600,
                60,
                0,
                0,
                24
        );

        var result = EloCalculator.calculateAdvanced(req);
        // 20 questions * 0.4 = 8.0 raw Elo gain (user Elo 1000 <= question Elo 1100)
        assertThat(result.rawEloGained()).isEqualTo(8.0, org.assertj.core.data.Offset.offset(0.001));
    }

    @Test
    void calculateAdvanced_highEloUserDoingEasyTest_earnsSignificantlyDiminishedPoints() {
        // User with Diamond Elo (1650) doing 3 Easy questions (900 Elo)
        var items = java.util.List.of(
                new EloCalculator.ItemInput(java.util.UUID.randomUUID(), 900, com.aiexam.learning.question.domain.Difficulty.BEGINNER, java.math.BigDecimal.ONE, java.math.BigDecimal.ONE),
                new EloCalculator.ItemInput(java.util.UUID.randomUUID(), 900, com.aiexam.learning.question.domain.Difficulty.BEGINNER, java.math.BigDecimal.ONE, java.math.BigDecimal.ONE),
                new EloCalculator.ItemInput(java.util.UUID.randomUUID(), 900, com.aiexam.learning.question.domain.Difficulty.BEGINNER, java.math.BigDecimal.ONE, java.math.BigDecimal.ONE)
        );

        var req = new EloCalculator.AdvancedCalculationRequest(
                1650,
                900,
                java.math.BigDecimal.valueOf(3.0),
                java.math.BigDecimal.valueOf(3.0),
                items,
                600,
                10,
                0,
                0,
                24
        );

        var result = EloCalculator.calculateAdvanced(req);
        // Without match penalty it would be 0.9. With 750 Elo gap penalty, it should be diminished to < 0.1
        assertThat(result.rawEloGained()).isLessThan(0.10);
        assertThat(result.rawEloGained()).isGreaterThanOrEqualTo(0.04);
    }
}
