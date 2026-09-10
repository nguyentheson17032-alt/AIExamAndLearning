package com.aiexam.learning.attempt.api;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record AnswerSubmitRequest(
        @NotNull UUID questionId,
        UUID selectedChoiceId,
        String textAnswer
) {}
