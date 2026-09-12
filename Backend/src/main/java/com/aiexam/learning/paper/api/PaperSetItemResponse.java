package com.aiexam.learning.paper.api;

import java.util.UUID;

public record PaperSetItemResponse(
        UUID id,
        Integer examNumber,
        String title,
        int durationMinutes,
        int questionCount
) {}
