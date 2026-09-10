package com.aiexam.learning.paper.api;

import com.aiexam.learning.paper.domain.PaperKind;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record PaperGenerateRequest(
        @NotNull UUID subjectId,
        @NotNull PaperKind kind,
        @NotNull @Min(1) @Max(50) Integer questionCount,
        @NotNull @Min(1) @Max(300) Integer durationMinutes,
        @Min(100) Integer targetEloMin,
        @Min(100) Integer targetEloMax,
        String title
) {}
