package com.aiexam.learning.ai.api;

import com.aiexam.learning.ai.domain.AiGenerationJob;
import com.aiexam.learning.ai.domain.AiJobStatus;
import com.aiexam.learning.ai.domain.AiJobType;

import java.time.Instant;
import java.util.UUID;

public record AiJobResponse(
        UUID id,
        AiJobType type,
        AiJobStatus status,
        String outputPayload,
        String errorMessage,
        Instant createdAt,
        Instant completedAt
) {
    public static AiJobResponse from(AiGenerationJob job) {
        return new AiJobResponse(
                job.getId(),
                job.getType(),
                job.getStatus(),
                job.getOutputPayload(),
                job.getErrorMessage(),
                job.getCreatedAt(),
                job.getCompletedAt()
        );
    }
}
