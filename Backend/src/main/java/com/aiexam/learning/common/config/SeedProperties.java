package com.aiexam.learning.common.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;
import org.springframework.validation.annotation.Validated;

@ConfigurationProperties(prefix = "app.seed")
@Validated
public record SeedProperties(
        @DefaultValue("false") Boolean enabled,
        @DefaultValue("false") Boolean ts10ExamSet,
        String ts10ImageDir
) {}

