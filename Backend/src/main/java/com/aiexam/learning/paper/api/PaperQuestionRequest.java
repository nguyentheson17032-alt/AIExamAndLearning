package com.aiexam.learning.paper.api;

import com.aiexam.learning.paper.domain.PaperSection;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record PaperQuestionRequest(
        @NotNull UUID questionId,
        @NotNull @DecimalMin("0.01") BigDecimal points,
        PaperSection section,
        String sectionTitle,
        String itemLabel,
        String groupKey
) {
    public PaperQuestionRequest(UUID questionId, BigDecimal points) {
        this(questionId, points, null, null, null, null);
    }
}
