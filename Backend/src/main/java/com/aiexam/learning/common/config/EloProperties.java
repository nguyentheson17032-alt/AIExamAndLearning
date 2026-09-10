package com.aiexam.learning.common.config;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@ConfigurationProperties(prefix = "app.elo")
@Validated
public record EloProperties(
        @NotNull @Min(1) Integer defaultRating,
        @NotNull @Min(1) Integer kFactor
) {}
