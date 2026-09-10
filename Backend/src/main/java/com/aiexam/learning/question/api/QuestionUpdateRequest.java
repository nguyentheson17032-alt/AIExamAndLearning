package com.aiexam.learning.question.api;

import com.aiexam.learning.question.domain.BloomLevel;
import com.aiexam.learning.question.domain.ContentStatus;
import com.aiexam.learning.question.domain.Difficulty;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record QuestionUpdateRequest(
        @NotBlank String stem,
        String answerKey,
        String explanation,
        @NotNull Difficulty difficulty,
        @NotNull @Min(100) @Max(3000) Integer eloRating,
        BloomLevel bloomLevel,
        @NotNull ContentStatus status,
        @Valid List<ChoiceRequest> choices
) {}
