package com.aiexam.learning.admin.api;

import com.aiexam.learning.attempt.domain.AttemptStatus;
import com.aiexam.learning.elo.domain.EloReason;
import com.aiexam.learning.user.domain.RankCode;
import com.aiexam.learning.user.domain.UserRole;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record AdminStudentDetailResponse(
        UUID id,
        String email,
        String displayName,
        UserRole role,
        int eloRating,
        RankCode rankCode,
        boolean enabled,
        Instant createdAt,
        long totalAttempts,
        List<StudentAttemptSummary> attempts,
        List<StudentEloHistorySummary> eloHistory
) {
    public record StudentAttemptSummary(
            UUID id,
            UUID paperId,
            String paperTitle,
            String subjectName,
            BigDecimal score,
            BigDecimal maxScore,
            Integer eloBefore,
            Integer eloAfter,
            Integer eloDelta,
            AttemptStatus status,
            Instant startedAt,
            Instant submittedAt,
            Instant gradedAt
    ) {}

    public record StudentEloHistorySummary(
            UUID id,
            int ratingBefore,
            int ratingAfter,
            int delta,
            EloReason reason,
            Instant createdAt,
            UUID attemptId,
            String paperTitle
    ) {}
}
