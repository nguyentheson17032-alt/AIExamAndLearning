package com.aiexam.learning.classroom.api;

import com.aiexam.learning.paper.domain.Paper;
import com.aiexam.learning.paper.domain.PaperKind;
import com.aiexam.learning.question.domain.ContentStatus;

import java.util.UUID;

public record ClassPaperResponse(
        UUID id,
        UUID subjectId,
        String title,
        PaperKind kind,
        int durationMinutes,
        ContentStatus status
) {
    public static ClassPaperResponse from(Paper paper) {
        return new ClassPaperResponse(
                paper.getId(),
                paper.getSubject().getId(),
                paper.getTitle(),
                paper.getKind(),
                paper.getDurationMinutes(),
                paper.getStatus()
        );
    }
}
