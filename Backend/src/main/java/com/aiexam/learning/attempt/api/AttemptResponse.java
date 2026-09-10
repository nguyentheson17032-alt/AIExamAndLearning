package com.aiexam.learning.attempt.api;

import com.aiexam.learning.attempt.domain.Attempt;
import com.aiexam.learning.attempt.domain.AttemptStatus;
import com.aiexam.learning.user.domain.RankCode;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record AttemptResponse(
        UUID id,
        UUID userId,
        UUID paperId,
        AttemptStatus status,
        Instant startedAt,
        Instant submittedAt,
        Instant gradedAt,
        BigDecimal score,
        BigDecimal maxScore,
        Integer eloBefore,
        Integer eloAfter,
        Integer eloDelta,
        RankCode rankAfter,
        List<AttemptAnswerResponse> answers
) {
    public static AttemptResponse from(Attempt attempt) {
        List<AttemptAnswerResponse> answers = attempt.getAnswers().stream()
                .map(answer -> new AttemptAnswerResponse(
                        answer.getQuestion().getId(),
                        answer.getSelectedChoice() == null ? null : answer.getSelectedChoice().getId(),
                        answer.getTextAnswer(),
                        answer.getCorrect(),
                        answer.getScore(),
                        answer.getAiFeedback(),
                        answer.getGradedBy()
                ))
                .toList();
        RankCode rank = attempt.getEloAfter() == null ? null : RankCode.fromElo(attempt.getEloAfter());
        return new AttemptResponse(
                attempt.getId(),
                attempt.getUser().getId(),
                attempt.getPaper().getId(),
                attempt.getStatus(),
                attempt.getStartedAt(),
                attempt.getSubmittedAt(),
                attempt.getGradedAt(),
                attempt.getScore(),
                attempt.getMaxScore(),
                attempt.getEloBefore(),
                attempt.getEloAfter(),
                attempt.getEloDelta(),
                rank,
                answers
        );
    }
}
