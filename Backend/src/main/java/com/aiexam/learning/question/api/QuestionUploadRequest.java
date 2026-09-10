package com.aiexam.learning.question.api;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record QuestionUploadRequest(@NotEmpty @Valid List<QuestionCreateRequest> questions) {}
