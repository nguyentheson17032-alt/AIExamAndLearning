package com.aiexam.learning.paper.api;

import com.aiexam.learning.question.api.QuestionResponse;

import java.math.BigDecimal;
import java.util.UUID;

public record PaperItemResponse(UUID questionId, int sortOrder, BigDecimal points, QuestionResponse question) {}
