package com.aiexam.learning.ai.api;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record MathGenerateBankRequest(
        @NotNull UUID subjectId,
        UUID topicId,
        String category,
        String difficulty,
        Integer count
) {}
