package com.aiexam.learning.common.config;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;
import org.springframework.validation.annotation.Validated;

@ConfigurationProperties(prefix = "app.ai")
@Validated
public record AiProperties(
        @NotNull Boolean enabled,
        @NotBlank String modelName,
        @DefaultValue("http://localhost:8000") String mathServiceUrl,
        @DefaultValue("http://localhost:8001") String physicsServiceUrl
) {}



