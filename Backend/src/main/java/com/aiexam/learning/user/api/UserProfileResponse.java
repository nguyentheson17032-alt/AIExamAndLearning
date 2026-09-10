package com.aiexam.learning.user.api;

import com.aiexam.learning.user.domain.RankCode;
import com.aiexam.learning.user.domain.User;
import com.aiexam.learning.user.domain.UserRole;

import java.util.UUID;

public record UserProfileResponse(
        UUID id,
        String email,
        String displayName,
        UserRole role,
        int eloRating,
        RankCode rankCode
) {
    public static UserProfileResponse from(User user) {
        return new UserProfileResponse(
                user.getId(),
                user.getEmail(),
                user.getDisplayName(),
                user.getRole(),
                user.getEloRating(),
                user.getRankCode()
        );
    }
}
