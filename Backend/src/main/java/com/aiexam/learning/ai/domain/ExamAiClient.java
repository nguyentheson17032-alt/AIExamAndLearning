package com.aiexam.learning.ai.domain;

import com.aiexam.learning.question.domain.BloomLevel;
import com.aiexam.learning.question.domain.Difficulty;
import com.aiexam.learning.question.domain.Question;
import com.aiexam.learning.question.domain.QuestionType;

import java.math.BigDecimal;
import java.util.List;

public interface ExamAiClient {

    ClassificationResult classify(Question question);

    GradeResult grade(Question question, String answer, BigDecimal maxPoints);

    EloSuggestion suggestElo(int currentElo, int paperElo, double scoreRatio, String summary);

    List<GeneratedQuestion> generateSimilar(Question question, int count);

    record ClassificationResult(
            List<String> tags,
            Difficulty difficulty,
            int eloRating,
            String category,
            BloomLevel bloomLevel,
            BigDecimal confidence,
            String modelName
    ) {}

    record GradeResult(boolean correct, BigDecimal score, String feedback, String modelName) {}

    record EloSuggestion(int suggestedElo, String rationale, String modelName) {}

    record GeneratedChoice(String label, String content, boolean correct) {}

    record GeneratedQuestion(
            QuestionType type,
            String stem,
            String answerKey,
            String explanation,
            Difficulty difficulty,
            int eloRating,
            BloomLevel bloomLevel,
            List<GeneratedChoice> choices
    ) {}
}
