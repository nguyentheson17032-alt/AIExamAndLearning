package com.aiexam.learning.paper.api;

import com.aiexam.learning.paper.domain.PaperSection;
import com.aiexam.learning.question.api.QuestionResponse;

import java.math.BigDecimal;
import java.util.UUID;

public record PaperItemResponse(
        UUID questionId,
        int sortOrder,
        BigDecimal points,
        PaperSection sectionCode,
        String sectionTitle,
        String itemLabel,
        String groupKey,
        QuestionResponse question
) {}
