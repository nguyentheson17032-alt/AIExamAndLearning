package com.aiexam.learning.admin.api;

import com.aiexam.learning.question.domain.ContentStatus;
import com.aiexam.learning.user.domain.RankCode;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record AdminClassroomDetailResponse(
        UUID id,
        String name,
        UUID teacherId,
        String teacherName,
        Instant createdAt,
        List<ClassMemberSummary> members,
        List<ClassPaperSummary> papers
) {
    public record ClassMemberSummary(
            UUID studentId,
            String displayName,
            String email,
            int eloRating,
            RankCode rankCode,
            Instant joinedAt
    ) {}

    public record ClassPaperSummary(
            UUID paperId,
            String title,
            String subjectName,
            int durationMinutes,
            int questionCount,
            ContentStatus status,
            Instant assignedAt
    ) {}
}
