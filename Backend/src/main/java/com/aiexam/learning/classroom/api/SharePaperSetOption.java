package com.aiexam.learning.classroom.api;

import java.util.List;
import java.util.UUID;

public record SharePaperSetOption(
        UUID id,
        UUID subjectId,
        String subjectName,
        String subjectCode,
        String title,
        String academicYear,
        int paperCount,
        List<ClassPaperResponse> papers
) {}

