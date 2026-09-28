package com.aiexam.learning.classroom.api;

import com.aiexam.learning.classroom.domain.Classroom;

import java.time.Instant;
import java.util.UUID;

public record ClassroomResponse(
        UUID id,
        String name,
        UUID teacherId,
        String teacherName,
        int memberCount,
        Instant createdAt
) {
    public static ClassroomResponse from(Classroom classroom, int memberCount) {
        return new ClassroomResponse(
                classroom.getId(),
                classroom.getName(),
                classroom.getTeacher().getId(),
                classroom.getTeacher().getDisplayName(),
                memberCount,
                classroom.getCreatedAt()
        );
    }
}
