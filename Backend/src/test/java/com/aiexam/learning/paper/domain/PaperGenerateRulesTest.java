package com.aiexam.learning.paper.domain;

import com.aiexam.learning.question.domain.QuestionType;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class PaperGenerateRulesTest {

    @Test
    void partOne_usesMcqDefaults() {
        assertThat(PaperGenerateRules.durationMinutes(PaperSection.PART_I, 10)).isEqualTo(20);
        assertThat(PaperGenerateRules.defaultEloMin(PaperSection.PART_I)).isEqualTo(1000);
        assertThat(PaperGenerateRules.defaultEloMax(PaperSection.PART_I)).isEqualTo(1100);
        assertThat(PaperGenerateRules.questionType(PaperSection.PART_I)).isEqualTo(QuestionType.MULTIPLE_CHOICE);
        assertThat(PaperGenerateRules.questionElo(PaperSection.PART_I)).isEqualTo(1050);
        assertThat(PaperGenerateRules.points(PaperSection.PART_I)).isEqualByComparingTo(new BigDecimal("0.25"));
    }

    @Test
    void partTwo_usesTrueFalseDefaults() {
        assertThat(PaperGenerateRules.durationMinutes(PaperSection.PART_II, 10)).isEqualTo(60);
        assertThat(PaperGenerateRules.defaultEloMin(PaperSection.PART_II)).isEqualTo(1100);
        assertThat(PaperGenerateRules.defaultEloMax(PaperSection.PART_II)).isEqualTo(1200);
        assertThat(PaperGenerateRules.questionType(PaperSection.PART_II)).isEqualTo(QuestionType.TRUE_FALSE);
        assertThat(PaperGenerateRules.questionElo(PaperSection.PART_II)).isEqualTo(1150);
    }

    @Test
    void partThree_usesShortAnswerDefaults() {
        assertThat(PaperGenerateRules.durationMinutes(PaperSection.PART_III, 10)).isEqualTo(30);
        assertThat(PaperGenerateRules.defaultEloMin(PaperSection.PART_III)).isEqualTo(1200);
        assertThat(PaperGenerateRules.defaultEloMax(PaperSection.PART_III)).isEqualTo(3000);
        assertThat(PaperGenerateRules.questionType(PaperSection.PART_III)).isEqualTo(QuestionType.SHORT_ANSWER);
        assertThat(PaperGenerateRules.questionElo(PaperSection.PART_III)).isEqualTo(1250);
        assertThat(PaperGenerateRules.points(PaperSection.PART_III)).isEqualByComparingTo(new BigDecimal("0.50"));
    }

    @Test
    void completePartTwoGroups_keepsOnlyFullAbcdSets() {
        UUID paper = UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
        UUID q1 = UUID.fromString("11111111-1111-1111-1111-111111111111");
        UUID q2 = UUID.fromString("22222222-2222-2222-2222-222222222222");
        UUID q3 = UUID.fromString("33333333-3333-3333-3333-333333333333");
        UUID q4 = UUID.fromString("44444444-4444-4444-4444-444444444444");
        UUID q5 = UUID.fromString("55555555-5555-5555-5555-555555555555");
        var groups = PaperGenerateRules.completePartTwoGroups(List.of(
                new PaperGenerateRules.SourceItem(paper, "II.1", q1, 1),
                new PaperGenerateRules.SourceItem(paper, "II.1", q1, 1),
                new PaperGenerateRules.SourceItem(paper, "II.1", q2, 2),
                new PaperGenerateRules.SourceItem(paper, "II.1", q3, 3),
                new PaperGenerateRules.SourceItem(paper, "II.1", q4, 4),
                new PaperGenerateRules.SourceItem(paper, "II.2", q5, 5)
        ));
        assertThat(groups).hasSize(1);
        assertThat(groups.getFirst()).extracting(PaperGenerateRules.SourceItem::questionId)
                .containsExactly(q1, q2, q3, q4);
        assertThat(PaperGenerateRules.partTwoItemLabel(2, 0)).isEqualTo("II.2a");
        assertThat(PaperGenerateRules.partTwoItemLabel(2, 3)).isEqualTo("II.2d");
    }
}
