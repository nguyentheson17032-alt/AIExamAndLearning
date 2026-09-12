package com.aiexam.learning.attempt.api;

import com.aiexam.learning.paper.api.PaperResponse;

public record AttemptSolutionResponse(AttemptResponse attempt, PaperResponse paper) {}
