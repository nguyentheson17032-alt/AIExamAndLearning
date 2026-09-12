package com.aiexam.learning.common.config;

import jakarta.validation.constraints.NotNull;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@ConfigurationProperties(prefix = "app.seed")
@Validated
public record SeedProperties(@NotNull Boolean ts10ExamSet) {}
