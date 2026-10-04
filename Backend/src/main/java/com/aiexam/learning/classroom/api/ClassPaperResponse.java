package com.aiexam.learning.classroom.api;

import com.aiexam.learning.paper.domain.Paper;
import com.aiexam.learning.paper.domain.PaperKind;
import com.aiexam.learning.paper.domain.PaperQuestion;
import com.aiexam.learning.question.domain.ContentStatus;
import com.aiexam.learning.question.domain.Difficulty;
import com.aiexam.learning.question.domain.QuestionType;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

public record ClassPaperResponse(
        UUID id,
        UUID subjectId,
        String subjectName,
        String subjectCode,
        String title,
        PaperKind kind,
        int durationMinutes,
        ContentStatus status,
        int questionCount,
        Difficulty difficulty,
        int targetEloMin,
        int targetEloMax,
        Integer examNumber,
        List<QuestionType> questionTypes,
        boolean inClass
) {
    public static ClassPaperResponse from(Paper paper) {
        return from(paper, false);
    }

    public static ClassPaperResponse from(Paper paper, boolean inClass) {
        int qCount = paper.getItems() != null ? paper.getItems().size() : 0;

        List<QuestionType> types = paper.getItems() != null
                ? paper.getItems().stream()
                .map(PaperQuestion::getQuestion)
                .filter(Objects::nonNull)
                .map(q -> q.getType())
                .filter(Objects::nonNull)
                .distinct()
                .toList()
                : List.of();

        Difficulty diff = determineDifficulty(paper);

        return new ClassPaperResponse(
                paper.getId(),
                paper.getSubject() != null ? paper.getSubject().getId() : null,
                paper.getSubject() != null ? paper.getSubject().getName() : null,
                paper.getSubject() != null ? paper.getSubject().getCode() : null,
                paper.getTitle(),
                paper.getKind(),
                paper.getDurationMinutes(),
                paper.getStatus(),
                qCount,
                diff,
                paper.getTargetEloMin(),
                paper.getTargetEloMax(),
                paper.getExamNumber(),
                types,
                inClass
        );
    }

    private static Difficulty determineDifficulty(Paper paper) {
        if (paper.getItems() != null && !paper.getItems().isEmpty()) {
            long beg = paper.getItems().stream().filter(i -> i.getQuestion() != null && i.getQuestion().getDifficulty() == Difficulty.BEGINNER).count();
            long inter = paper.getItems().stream().filter(i -> i.getQuestion() != null && i.getQuestion().getDifficulty() == Difficulty.INTERMEDIATE).count();
            long adv = paper.getItems().stream().filter(i -> i.getQuestion() != null && i.getQuestion().getDifficulty() == Difficulty.ADVANCED).count();
            long exp = paper.getItems().stream().filter(i -> i.getQuestion() != null && i.getQuestion().getDifficulty() == Difficulty.EXPERT).count();

            if (exp > 0 && exp >= adv && exp >= inter && exp >= beg) return Difficulty.EXPERT;
            if (adv > 0 && adv >= inter && adv >= beg) return Difficulty.ADVANCED;
            if (inter > 0 && inter >= beg) return Difficulty.INTERMEDIATE;
            if (beg > 0) return Difficulty.BEGINNER;
        }

        int avgElo = (paper.getTargetEloMin() + paper.getTargetEloMax()) / 2;
        if (avgElo >= 1800) return Difficulty.EXPERT;
        if (avgElo >= 1500) return Difficulty.ADVANCED;
        if (avgElo >= 1200) return Difficulty.INTERMEDIATE;
        return Difficulty.BEGINNER;
    }
}

