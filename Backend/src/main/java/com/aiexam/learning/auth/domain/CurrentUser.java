package com.aiexam.learning.auth.domain;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

public final class CurrentUser {

    private CurrentUser() {}

    public static AuthUserDetails require() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthUserDetails details)) {
            throw new IllegalStateException("Authenticated user is required");
        }
        return details;
    }

    public static UUID id() {
        return require().getId();
    }

    public static boolean teacherOrAdmin() {
        return switch (require().getRole()) {
            case TEACHER, ADMIN -> true;
            case STUDENT -> false;
        };
    }
}
