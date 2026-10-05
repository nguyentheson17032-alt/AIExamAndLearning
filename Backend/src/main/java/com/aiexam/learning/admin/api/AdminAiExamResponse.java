package com.aiexam.learning.admin.api;

import com.aiexam.learning.paper.domain.PaperKind;
import com.aiexam.learning.paper.domain.PaperSource;
import com.aiexam.learning.question.domain.ContentStatus;

import java.time.Instant;
import java.util.UUID;

public record AdminAiExamResponse(
        UUID id,
        String title,
        UUID subjectId,
        String subjectName,
        PaperKind kind,
        PaperSource source,
        int durationMinutes,
        int targetEloMin,
        int targetEloMax,
        int questionCount,
        ContentStatus status,
        Instant createdAt,
        String authorName
) {}
