package com.aiexam.learning.question.api;

import com.aiexam.learning.question.domain.QuestionChoice;

import java.util.UUID;

public record ChoiceResponse(UUID id, String label, String content, boolean correct, int sortOrder) {
    public static ChoiceResponse from(QuestionChoice choice) {
        return new ChoiceResponse(
                choice.getId(),
                choice.getLabel(),
                choice.getContent(),
                choice.isCorrect(),
                choice.getSortOrder()
        );
    }

    public static ChoiceResponse publicView(QuestionChoice choice) {
        return new ChoiceResponse(choice.getId(), choice.getLabel(), choice.getContent(), false, choice.getSortOrder());
    }
}
