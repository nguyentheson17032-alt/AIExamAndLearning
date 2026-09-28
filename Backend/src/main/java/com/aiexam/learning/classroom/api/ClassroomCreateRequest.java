package com.aiexam.learning.classroom.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ClassroomCreateRequest(
        @NotBlank @Size(max = 120) String name
) {}
