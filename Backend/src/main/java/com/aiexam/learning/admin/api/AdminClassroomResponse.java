package com.aiexam.learning.admin.api;

import java.time.Instant;
import java.util.UUID;

public record AdminClassroomResponse(
        UUID id,
        String name,
        UUID teacherId,
        String teacherName,
        int memberCount,
        int paperCount,
        Instant createdAt
) {}
