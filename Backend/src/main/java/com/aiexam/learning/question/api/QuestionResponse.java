package com.aiexam.learning.question.api;

import com.aiexam.learning.question.domain.BloomLevel;
import com.aiexam.learning.question.domain.ContentStatus;
import com.aiexam.learning.question.domain.Difficulty;
import com.aiexam.learning.question.domain.Question;
import com.aiexam.learning.question.domain.QuestionSource;
import com.aiexam.learning.question.domain.QuestionType;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record QuestionResponse(
        UUID id,
        UUID authorId,
        UUID subjectId,
        UUID topicId,
        UUID similarToQuestionId,
        QuestionType type,
        String stem,
        String answerKey,
        String explanation,
        Difficulty difficulty,
        int eloRating,
        BloomLevel bloomLevel,
        QuestionSource source,
        ContentStatus status,
        List<ChoiceResponse> choices,
        Instant createdAt
) {
    public static QuestionResponse from(Question question) {
        return from(question, true);
    }

    public static QuestionResponse from(Question question, boolean includeAnswer) {
        List<ChoiceResponse> choices = question.getChoices().stream()
                .map(choice -> includeAnswer ? ChoiceResponse.from(choice) : ChoiceResponse.publicView(choice))
                .toList();
        return new QuestionResponse(
                question.getId(),
                question.getAuthor().getId(),
                question.getSubject().getId(),
                question.getTopic() == null ? null : question.getTopic().getId(),
                question.getSimilarTo() == null ? null : question.getSimilarTo().getId(),
                question.getType(),
                question.getStem(),
                includeAnswer ? question.getAnswerKey() : null,
                includeAnswer ? question.getExplanation() : null,
                question.getDifficulty(),
                question.getEloRating(),
                question.getBloomLevel(),
                question.getSource(),
                question.getStatus(),
                choices,
                question.getCreatedAt()
        );
    }
}
