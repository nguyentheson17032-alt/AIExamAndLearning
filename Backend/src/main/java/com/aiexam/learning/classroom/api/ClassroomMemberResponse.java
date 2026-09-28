package com.aiexam.learning.classroom.api;

import com.aiexam.learning.classroom.domain.ClassroomMember;

import java.time.Instant;
import java.util.UUID;

public record ClassroomMemberResponse(
        UUID studentId,
        String displayName,
        Instant joinedAt
) {
    public static ClassroomMemberResponse from(ClassroomMember member) {
        return new ClassroomMemberResponse(
                member.getStudent().getId(),
                member.getStudent().getDisplayName(),
                member.getCreatedAt()
        );
    }
}
