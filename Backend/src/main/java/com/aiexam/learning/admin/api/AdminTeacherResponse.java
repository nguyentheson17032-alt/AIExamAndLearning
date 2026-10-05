package com.aiexam.learning.admin.api;

import com.aiexam.learning.user.domain.UserRole;

import java.time.Instant;
import java.util.UUID;

public record AdminTeacherResponse(
        UUID id,
        String email,
        String displayName,
        UserRole role,
        boolean enabled,
        Instant createdAt,
        long classroomsCount,
        long papersCount
) {}
