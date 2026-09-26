package com.aiexam.learning.attempt.domain;

import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;

class AttemptDeadlineTest {

    private static final Instant STARTED = Instant.parse("2026-09-26T07:00:00Z");

    @Test
    void allowsPartial_onlyInsideTheGraceWindowOrAfterTheDeadline() {
        Instant deadline = STARTED.plusSeconds(90 * 60);

        assertThat(AttemptDeadline.allowsPartial(STARTED, 90, deadline.minusSeconds(16))).isFalse();
        assertThat(AttemptDeadline.allowsPartial(STARTED, 90, deadline.minusSeconds(15))).isTrue();
        assertThat(AttemptDeadline.allowsPartial(STARTED, 90, deadline)).isTrue();
        assertThat(AttemptDeadline.allowsPartial(STARTED, 90, deadline.plusSeconds(30))).isTrue();
    }
}
