package com.aiexam.learning.paper.api;

import com.aiexam.learning.paper.domain.PaperKind;
import com.aiexam.learning.paper.domain.PaperSection;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record PaperGenerateRequest(
        @NotNull UUID subjectId,
        PaperKind kind,
        @NotNull PaperSection section,
        @NotNull @Min(1) @Max(99) Integer questionCount,
        @Min(1) @Max(600) Integer durationMinutes,
        @Min(100) Integer targetEloMin,
        @Min(100) Integer targetEloMax,
        String title
) {}
