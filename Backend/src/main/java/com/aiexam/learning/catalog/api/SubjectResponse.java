package com.aiexam.learning.catalog.api;

import com.aiexam.learning.catalog.domain.Subject;

import java.time.Instant;
import java.util.UUID;

public record SubjectResponse(UUID id, String code, String name, String description, Instant createdAt) {
    public static SubjectResponse from(Subject subject) {
        return new SubjectResponse(
                subject.getId(),
                subject.getCode(),
                subject.getName(),
                subject.getDescription(),
                subject.getCreatedAt()
        );
    }
}
