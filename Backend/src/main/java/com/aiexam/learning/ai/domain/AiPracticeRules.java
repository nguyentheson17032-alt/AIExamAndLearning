package com.aiexam.learning.ai.domain;

import com.aiexam.learning.paper.domain.PaperGenerateRules;
import com.aiexam.learning.question.domain.QuestionType;

import java.util.ArrayList;
import java.util.List;

public final class AiPracticeRules {

    public static final int MAX_QUESTION_COUNT = 99;
    public static final int DEFAULT_QUESTION_COUNT = 5;
    public static final int SECONDS_PER_QUESTION = 30;
    public static final double MINUTES_PER_QUESTION = SECONDS_PER_QUESTION / 60.0;

    public record TrueFalseSlot(int groupNumber, int indexInGroup, String groupKey, String itemLabel) {}

    private AiPracticeRules() {}

    public static int clampQuestionCount(Integer questionCount) {
        int count = questionCount == null ? DEFAULT_QUESTION_COUNT : questionCount;
        return Math.min(MAX_QUESTION_COUNT, Math.max(1, count));
    }

    public static int durationMinutes(int questionCount) {
        return Math.max(1, (int) Math.round(clampQuestionCount(questionCount) * MINUTES_PER_QUESTION));
    }

    public static int generatedQuestionCount(QuestionType type, int questionCount) {
        int count = clampQuestionCount(questionCount);
        if (type == QuestionType.TRUE_FALSE) {
            return count * PaperGenerateRules.PART_II_GROUP_SIZE;
        }
        return count;
    }

    public static List<TrueFalseSlot> trueFalseSlots(int groupCount) {
        int groups = clampQuestionCount(groupCount);
        List<TrueFalseSlot> slots = new ArrayList<>(groups * PaperGenerateRules.PART_II_GROUP_SIZE);
        for (int group = 1; group <= groups; group++) {
            for (int index = 0; index < PaperGenerateRules.PART_II_GROUP_SIZE; index++) {
                slots.add(new TrueFalseSlot(
                        group,
                        index,
                        PaperGenerateRules.partTwoGroupKey(group),
                        PaperGenerateRules.partTwoItemLabel(group, index)
                ));
            }
        }
        return slots;
    }
}
