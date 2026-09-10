package com.aiexam.learning.question.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChoiceRequest(
        @NotBlank @Size(max = 8) String label,
        @NotBlank String content,
        boolean correct
) {}
