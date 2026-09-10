package com.aiexam.learning.catalog.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SubjectCreateRequest(
        @NotBlank @Size(max = 32) String code,
        @NotBlank @Size(max = 120) String name,
        @Size(max = 2000) String description
) {}
