package com.aiexam.learning.attempt.api;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record AttemptSubmitRequest(@NotEmpty @Valid List<AnswerSubmitRequest> answers) {}
