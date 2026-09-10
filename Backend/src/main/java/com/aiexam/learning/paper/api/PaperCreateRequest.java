package com.aiexam.learning.paper.api;

import com.aiexam.learning.paper.domain.PaperKind;
import com.aiexam.learning.paper.domain.PaperSource;
import com.aiexam.learning.question.domain.ContentStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.UUID;

public record PaperCreateRequest(
        @NotNull UUID subjectId,
        @NotBlank @Size(max = 200) String title,
        String description,
        @NotNull PaperKind kind,
        PaperSource source,
        @NotNull @Min(1) @Max(300) Integer durationMinutes,
        @NotNull @Min(100) Integer targetEloMin,
        @NotNull @Min(100) Integer targetEloMax,
        ContentStatus status,
        @NotEmpty @Valid List<PaperQuestionRequest> questions
) {}
