package com.aiexam.learning.attempt.api;

import com.aiexam.learning.attempt.domain.GradedBy;

import java.math.BigDecimal;
import java.util.UUID;

public record AttemptAnswerResponse(
        UUID questionId,
        UUID selectedChoiceId,
        String textAnswer,
        Boolean correct,
        BigDecimal score,
        String aiFeedback,
        GradedBy gradedBy
) {}
