package com.aiexam.learning.paper.domain;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;
import java.util.UUID;

public final class BankPracticePicker {

    public sealed interface Unit permits Single, TrueFalseGroup {}

    public record Single(UUID questionId, PaperSection section) implements Unit {}

    public record TrueFalseGroup(List<UUID> questionIds) implements Unit {
        public TrueFalseGroup {
            if (questionIds == null || questionIds.size() != PaperGenerateRules.PART_II_GROUP_SIZE) {
                throw new IllegalArgumentException("TRUE_FALSE group must have 4 statements");
            }
            questionIds = List.copyOf(questionIds);
        }
    }

    private BankPracticePicker() {}

    public static List<Unit> pool(
            List<UUID> multipleChoiceIds,
            List<UUID> shortAnswerIds,
            List<List<UUID>> trueFalseGroups
    ) {
        List<Unit> units = new ArrayList<>();
        for (UUID id : multipleChoiceIds) {
            units.add(new Single(id, PaperSection.PART_I));
        }
        for (UUID id : shortAnswerIds) {
            units.add(new Single(id, PaperSection.PART_III));
        }
        for (List<UUID> group : trueFalseGroups) {
            if (group != null && group.size() == PaperGenerateRules.PART_II_GROUP_SIZE) {
                units.add(new TrueFalseGroup(group));
            }
        }
        return units;
    }

    public static List<Unit> pick(List<Unit> pool, int count, Random random) {
        if (count < 1 || pool.size() < count) {
            return List.of();
        }
        List<Unit> shuffled = new ArrayList<>(pool);
        Collections.shuffle(shuffled, random);
        return List.copyOf(shuffled.subList(0, count));
    }
}
