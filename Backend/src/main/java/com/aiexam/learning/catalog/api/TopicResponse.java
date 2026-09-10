package com.aiexam.learning.catalog.api;

import com.aiexam.learning.catalog.domain.Topic;

import java.time.Instant;
import java.util.UUID;

public record TopicResponse(UUID id, UUID subjectId, String name, String description, Instant createdAt) {
    public static TopicResponse from(Topic topic) {
        return new TopicResponse(
                topic.getId(),
                topic.getSubject().getId(),
                topic.getName(),
                topic.getDescription(),
                topic.getCreatedAt()
        );
    }
}
