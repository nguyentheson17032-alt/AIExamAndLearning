package com.aiexam.learning.paper.api;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record PracticeStartRequest(
        @NotNull UUID subjectId,
        @Min(1) @Max(30) Integer questionCount,
        @Min(10) @Max(180) Integer durationMinutes
) {}
