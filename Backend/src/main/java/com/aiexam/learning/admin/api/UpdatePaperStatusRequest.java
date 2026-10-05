package com.aiexam.learning.admin.api;

import com.aiexam.learning.question.domain.ContentStatus;
import jakarta.validation.constraints.NotNull;

public record UpdatePaperStatusRequest(
        @NotNull ContentStatus status
) {}
