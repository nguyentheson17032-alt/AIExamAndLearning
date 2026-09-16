package com.aiexam.learning.ai.api;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record PracticeGenerateRequest(
        @NotNull UUID subjectId,
        @Min(1) @Max(99) Integer questionCount,
        @Min(1) @Max(300) Integer durationMinutes
) {}
