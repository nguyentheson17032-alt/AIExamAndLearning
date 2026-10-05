package com.aiexam.learning.admin.api;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record UpdateUserEloRequest(
        @Min(0) @Max(4000)
        int eloRating
) {}
