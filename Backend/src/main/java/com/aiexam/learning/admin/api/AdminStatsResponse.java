package com.aiexam.learning.admin.api;

import java.util.Map;

public record AdminStatsResponse(
        long totalStudents,
        long totalTeachers,
        long totalClassrooms,
        long totalQuestions,
        long totalPapers,
        long totalAiExams,
        long totalAttempts,
        Map<String, Long> rankDistribution
) {}
