package com.aiexam.learning.attempt.domain;

import com.aiexam.learning.attempt.api.AnswerSubmitRequest;

import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

final class AttemptCompleteness {

    private AttemptCompleteness() {
    }

    static boolean filled(UUID selectedChoiceId, String textAnswer) {
        if (selectedChoiceId != null) {
            return true;
        }
        return textAnswer != null && !textAnswer.isBlank();
    }

    static List<UUID> unanswered(Collection<UUID> paperQuestionIds, List<AnswerSubmitRequest> answers) {
        Set<UUID> done = new HashSet<>();
        for (AnswerSubmitRequest answer : answers) {
            if (filled(answer.selectedChoiceId(), answer.textAnswer())) {
                done.add(answer.questionId());
            }
        }
        return paperQuestionIds.stream().filter(id -> !done.contains(id)).toList();
    }
}
