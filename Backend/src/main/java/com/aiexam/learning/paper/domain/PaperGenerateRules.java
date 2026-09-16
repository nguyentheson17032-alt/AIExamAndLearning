package com.aiexam.learning.paper.domain;

import com.aiexam.learning.attempt.domain.Ts10Scoring;
import com.aiexam.learning.question.domain.QuestionType;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

public final class PaperGenerateRules {

    public static final int MAX_QUESTION_COUNT = 99;
    public static final int PART_II_GROUP_SIZE = 4;
    public static final int PART_III_ELO_MAX = 3000;

    public record SourceItem(UUID paperId, String groupKey, UUID questionId, int sortOrder) {}

    private PaperGenerateRules() {}

    public static int durationMinutes(PaperSection section, int questionCount) {
        return questionCount * minutesPerQuestion(section);
    }

    public static int minutesPerQuestion(PaperSection section) {
        return switch (section) {
            case PART_I -> 2;
            case PART_II -> 6;
            case PART_III -> 3;
        };
    }

    public static int defaultEloMin(PaperSection section) {
        return switch (section) {
            case PART_I -> 1000;
            case PART_II -> 1100;
            case PART_III -> 1200;
        };
    }

    public static int defaultEloMax(PaperSection section) {
        return switch (section) {
            case PART_I -> 1100;
            case PART_II -> 1200;
            case PART_III -> PART_III_ELO_MAX;
        };
    }

    public static int questionElo(PaperSection section) {
        return switch (section) {
            case PART_I -> 1050;
            case PART_II -> 1150;
            case PART_III -> 1250;
        };
    }

    public static QuestionType questionType(PaperSection section) {
        return switch (section) {
            case PART_I -> QuestionType.MULTIPLE_CHOICE;
            case PART_II -> QuestionType.TRUE_FALSE;
            case PART_III -> QuestionType.SHORT_ANSWER;
        };
    }

    public static String sectionTitle(PaperSection section) {
        return switch (section) {
            case PART_I -> "Phần I";
            case PART_II -> "Phần II";
            case PART_III -> "Phần III";
        };
    }

    public static BigDecimal points(PaperSection section) {
        return section == PaperSection.PART_III ? Ts10Scoring.PART_III_POINTS : Ts10Scoring.PART_I_POINTS;
    }

    public static String partOneItemLabel(int questionNumber) {
        return "I." + questionNumber;
    }

    public static String partTwoGroupKey(int groupNumber) {
        return "II." + groupNumber;
    }

    public static String partThreeItemLabel(int questionNumber) {
        return "III." + questionNumber;
    }

    public static String partTwoItemLabel(int groupNumber, int indexInGroup) {
        return partTwoGroupKey(groupNumber) + (char) ('a' + indexInGroup);
    }

    public static List<List<SourceItem>> completePartTwoGroups(List<SourceItem> items) {
        Map<String, List<SourceItem>> byGroup = new LinkedHashMap<>();
        for (SourceItem item : items) {
            if (item.paperId() == null || item.groupKey() == null || item.questionId() == null) {
                continue;
            }
            byGroup.computeIfAbsent(item.paperId() + ":" + item.groupKey(), ignored -> new ArrayList<>()).add(item);
        }
        List<List<SourceItem>> groups = new ArrayList<>();
        Set<String> seen = new LinkedHashSet<>();
        for (List<SourceItem> group : byGroup.values()) {
            Map<UUID, SourceItem> unique = new LinkedHashMap<>();
            group.stream()
                    .sorted(Comparator.comparingInt(SourceItem::sortOrder))
                    .forEach(item -> unique.putIfAbsent(item.questionId(), item));
            if (unique.size() != PART_II_GROUP_SIZE) {
                continue;
            }
            List<SourceItem> ordered = List.copyOf(unique.values());
            String fingerprint = ordered.stream()
                    .map(item -> item.questionId().toString())
                    .sorted()
                    .collect(Collectors.joining(","));
            if (!seen.add(fingerprint)) {
                continue;
            }
            groups.add(ordered);
        }
        return groups;
    }
}
