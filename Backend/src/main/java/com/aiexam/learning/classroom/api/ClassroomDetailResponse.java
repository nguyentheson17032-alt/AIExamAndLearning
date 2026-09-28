package com.aiexam.learning.classroom.api;

import java.util.List;
import java.util.UUID;

public record ClassroomDetailResponse(
        UUID id,
        String name,
        UUID teacherId,
        String teacherName,
        boolean teacher,
        List<ClassroomMemberResponse> members,
        List<ClassPaperResponse> papers
) {}
