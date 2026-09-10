package com.aiexam.learning.auth.api;

import com.aiexam.learning.user.domain.RankCode;
import com.aiexam.learning.user.domain.UserRole;

import java.util.UUID;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        long expiresInSeconds,
        UUID userId,
        String email,
        String displayName,
        UserRole role,
        int eloRating,
        RankCode rankCode
) {}
