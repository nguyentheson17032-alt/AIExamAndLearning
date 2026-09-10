package com.aiexam.learning.ai.api;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record SimilarGenerateRequest(@Min(1) @Max(10) Integer count) {}
