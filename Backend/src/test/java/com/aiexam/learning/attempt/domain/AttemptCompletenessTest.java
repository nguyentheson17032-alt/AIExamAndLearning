package com.aiexam.learning.attempt.domain;

import com.aiexam.learning.attempt.api.AnswerSubmitRequest;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class AttemptCompletenessTest {

    private static final UUID Q1 = UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1");
    private static final UUID Q2 = UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2");
    private static final UUID CHOICE = UUID.fromString("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");

    @Test
    void unanswered_whenAChoiceIsMissing() {
        List<UUID> missing = AttemptCompleteness.unanswered(
                List.of(Q1, Q2),
                List.of(new AnswerSubmitRequest(Q1, CHOICE, null), new AnswerSubmitRequest(Q2, null, "  "))
        );

        assertThat(missing).containsExactly(Q2);
    }

    @Test
    void unanswered_emptyWhenEveryQuestionFilled() {
        List<UUID> missing = AttemptCompleteness.unanswered(
                List.of(Q1, Q2),
                List.of(new AnswerSubmitRequest(Q1, CHOICE, null), new AnswerSubmitRequest(Q2, null, "12"))
        );

        assertThat(missing).isEmpty();
    }
}
