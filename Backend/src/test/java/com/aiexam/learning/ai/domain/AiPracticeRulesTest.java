package com.aiexam.learning.ai.domain;

import com.aiexam.learning.question.domain.QuestionType;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class AiPracticeRulesTest {

    @Test
    void durationMinutes_isQuestionCountTimesTwoPointFive() {
        assertThat(AiPracticeRules.durationMinutes(1)).isEqualTo(3);
        assertThat(AiPracticeRules.durationMinutes(4)).isEqualTo(10);
        assertThat(AiPracticeRules.durationMinutes(5)).isEqualTo(13);
        assertThat(AiPracticeRules.durationMinutes(10)).isEqualTo(25);
    }

    @Test
    void clampQuestionCount_capsBelow100() {
        assertThat(AiPracticeRules.clampQuestionCount(null)).isEqualTo(5);
        assertThat(AiPracticeRules.clampQuestionCount(0)).isEqualTo(1);
        assertThat(AiPracticeRules.clampQuestionCount(99)).isEqualTo(99);
        assertThat(AiPracticeRules.clampQuestionCount(100)).isEqualTo(99);
    }

    @Test
    void generatedQuestionCount_trueFalseUsesFourItemsPerGroup() {
        assertThat(AiPracticeRules.generatedQuestionCount(QuestionType.TRUE_FALSE, 2)).isEqualTo(8);
        assertThat(AiPracticeRules.generatedQuestionCount(QuestionType.MULTIPLE_CHOICE, 2)).isEqualTo(2);
    }

    @Test
    void trueFalseSlots_labelsFourStatementsPerGroup() {
        assertThat(AiPracticeRules.trueFalseSlots(2)).extracting(AiPracticeRules.TrueFalseSlot::itemLabel)
                .containsExactly("II.1a", "II.1b", "II.1c", "II.1d", "II.2a", "II.2b", "II.2c", "II.2d");
    }
}
