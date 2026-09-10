package com.aiexam.learning.elo.api;

import com.aiexam.learning.elo.domain.EloEvent;
import com.aiexam.learning.elo.domain.EloReason;
import com.aiexam.learning.user.domain.RankCode;

import java.time.Instant;
import java.util.UUID;

public record EloEventResponse(
        UUID id,
        int ratingBefore,
        int ratingAfter,
        int delta,
        EloReason reason,
        RankCode rankAfter,
        Instant createdAt
) {
    public static EloEventResponse from(EloEvent event) {
        return new EloEventResponse(
                event.getId(),
                event.getRatingBefore(),
                event.getRatingAfter(),
                event.getDelta(),
                event.getReason(),
                RankCode.fromElo(event.getRatingAfter()),
                event.getCreatedAt()
        );
    }
}
