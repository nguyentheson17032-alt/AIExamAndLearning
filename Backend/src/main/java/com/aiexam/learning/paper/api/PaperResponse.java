package com.aiexam.learning.paper.api;

import com.aiexam.learning.paper.domain.Paper;
import com.aiexam.learning.paper.domain.PaperKind;
import com.aiexam.learning.paper.domain.PaperSource;
import com.aiexam.learning.question.api.QuestionResponse;
import com.aiexam.learning.question.domain.ContentStatus;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record PaperResponse(
        UUID id,
        UUID authorId,
        UUID subjectId,
        UUID paperSetId,
        Integer examNumber,
        String title,
        String description,
        PaperKind kind,
        PaperSource source,
        int durationMinutes,
        int targetEloMin,
        int targetEloMax,
        ContentStatus status,
        List<PaperItemResponse> questions,
        Instant createdAt,
        Instant updatedAt
) {
    public static PaperResponse from(Paper paper, boolean includeAnswer) {
        List<PaperItemResponse> items = paper.getItems().stream()
                .map(item -> new PaperItemResponse(
                        item.getQuestion().getId(),
                        item.getSortOrder(),
                        item.getPoints(),
                        item.getSection(),
                        item.getSectionTitle(),
                        item.getItemLabel(),
                        item.getGroupKey(),
                        QuestionResponse.from(item.getQuestion(), includeAnswer)
                ))
                .toList();
        return new PaperResponse(
                paper.getId(),
                paper.getAuthor().getId(),
                paper.getSubject().getId(),
                paper.getPaperSet() == null ? null : paper.getPaperSet().getId(),
                paper.getExamNumber(),
                paper.getTitle(),
                paper.getDescription(),
                paper.getKind(),
                paper.getSource(),
                paper.getDurationMinutes(),
                paper.getTargetEloMin(),
                paper.getTargetEloMax(),
                paper.getStatus(),
                items,
                paper.getCreatedAt(),
                paper.getUpdatedAt()
        );
    }
}
