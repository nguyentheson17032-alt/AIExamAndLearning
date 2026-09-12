package com.aiexam.learning.paper.api;

import com.aiexam.learning.paper.domain.PaperSet;
import com.aiexam.learning.question.domain.ContentStatus;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record PaperSetResponse(
        UUID id,
        UUID authorId,
        UUID subjectId,
        String title,
        String academicYear,
        String description,
        ContentStatus status,
        int paperCount,
        Instant createdAt,
        List<PaperSetItemResponse> papers
) {
    public static PaperSetResponse summary(PaperSet set, int paperCount) {
        return new PaperSetResponse(
                set.getId(),
                set.getAuthor().getId(),
                set.getSubject().getId(),
                set.getTitle(),
                set.getAcademicYear(),
                set.getDescription(),
                set.getStatus(),
                paperCount,
                set.getCreatedAt(),
                List.of()
        );
    }

    public static PaperSetResponse detail(PaperSet set, List<PaperSetItemResponse> papers) {
        return new PaperSetResponse(
                set.getId(),
                set.getAuthor().getId(),
                set.getSubject().getId(),
                set.getTitle(),
                set.getAcademicYear(),
                set.getDescription(),
                set.getStatus(),
                papers.size(),
                set.getCreatedAt(),
                papers
        );
    }
}
