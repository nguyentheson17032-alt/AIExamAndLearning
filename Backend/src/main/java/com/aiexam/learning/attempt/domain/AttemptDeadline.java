package com.aiexam.learning.attempt.domain;

import java.time.Duration;
import java.time.Instant;

final class AttemptDeadline {

    static final int GRACE_SECONDS = 15;

    private AttemptDeadline() {
    }

    static boolean allowsPartial(Instant startedAt, int durationMinutes, Instant now) {
        Instant deadline = startedAt.plus(Duration.ofMinutes(durationMinutes));
        return !now.plusSeconds(GRACE_SECONDS).isBefore(deadline);
    }
}
