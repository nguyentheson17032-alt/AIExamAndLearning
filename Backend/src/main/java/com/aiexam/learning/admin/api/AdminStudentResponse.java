package com.aiexam.learning.admin.api;

import com.aiexam.learning.user.domain.RankCode;
import com.aiexam.learning.user.domain.UserRole;

import java.time.Instant;
import java.util.UUID;

public record AdminStudentResponse(
        UUID id,
        String email,
        String displayName,
        UserRole role,
        int eloRating,
        RankCode rankCode,
        boolean enabled,
        Instant createdAt,
        long totalAttempts
) {}
