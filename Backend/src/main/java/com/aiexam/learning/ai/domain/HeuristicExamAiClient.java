package com.aiexam.learning.ai.domain;

import com.aiexam.learning.elo.domain.EloCalculator;
import com.aiexam.learning.question.domain.BloomLevel;
import com.aiexam.learning.question.domain.Difficulty;
import com.aiexam.learning.question.domain.Question;
import com.aiexam.learning.question.domain.QuestionChoice;
import com.aiexam.learning.question.domain.QuestionType;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Component
public class HeuristicExamAiClient implements ExamAiClient {

    public static final String MODEL = "heuristic";

    @Override
    public ClassificationResult classify(Question question) {
        String stem = question.getStem() == null ? "" : question.getStem().toLowerCase(Locale.ROOT);
        BloomLevel bloom = inferBloom(stem, question.getType());
        Difficulty difficulty = inferDifficulty(stem, question.getType(), question.getEloRating());
        int elo = switch (difficulty) {
            case BEGINNER -> 900;
            case INTERMEDIATE -> 1100;
            case ADVANCED -> 1300;
            case EXPERT -> 1550;
        };
        List<String> tags = new ArrayList<>();
        tags.add(question.getType().name().toLowerCase(Locale.ROOT));
        tags.add(difficulty.name().toLowerCase(Locale.ROOT));
        if (question.getTopic() != null) {
            tags.add(question.getTopic().getName());
        }
        return new ClassificationResult(
                tags,
                difficulty,
                elo,
                question.getSubject().getCode(),
                bloom,
                new BigDecimal("0.6200"),
                MODEL
        );
    }

    @Override
    public GradeResult grade(Question question, String answer, BigDecimal maxPoints) {
        if (answer == null || answer.isBlank()) {
            return new GradeResult(false, BigDecimal.ZERO.setScale(2), "Empty answer", MODEL);
        }
        if (question.getType() == QuestionType.SHORT_ANSWER) {
            boolean match = normalize(answer).equals(normalize(question.getAnswerKey()));
            BigDecimal score = match ? maxPoints : BigDecimal.ZERO;
            return new GradeResult(match, score.setScale(2, RoundingMode.HALF_UP),
                    match ? "Matches the answer key" : "Does not match the answer key", MODEL);
        }
        int length = answer.trim().length();
        BigDecimal ratio = length >= 180 ? new BigDecimal("0.80")
                : length >= 80 ? new BigDecimal("0.60")
                : new BigDecimal("0.30");
        BigDecimal score = maxPoints.multiply(ratio).setScale(2, RoundingMode.HALF_UP);
        return new GradeResult(ratio.compareTo(new BigDecimal("0.60")) >= 0, score,
                "Heuristic essay score based on development length", MODEL);
    }

    @Override
    public EloSuggestion suggestElo(int currentElo, int paperElo, double scoreRatio, String summary) {
        int suggested = EloCalculator.nextRating(currentElo, paperElo, scoreRatio, 24);
        if (scoreRatio >= 0.9) {
            suggested += 8;
        } else if (scoreRatio <= 0.3) {
            suggested -= 6;
        }
        return new EloSuggestion(suggested, summary, MODEL);
    }

    @Override
    public List<GeneratedQuestion> generateSimilar(Question question, int count) {
        List<GeneratedQuestion> generated = new ArrayList<>();
        for (int i = 1; i <= count; i++) {
            List<GeneratedChoice> choices = new ArrayList<>();
            for (QuestionChoice choice : question.getChoices()) {
                choices.add(new GeneratedChoice(choice.getLabel(), choice.getContent(), choice.isCorrect()));
            }
            generated.add(new GeneratedQuestion(
                    question.getType(),
                    "[Biến thể " + i + "] " + question.getStem(),
                    question.getAnswerKey(),
                    question.getExplanation(),
                    question.getDifficulty(),
                    question.getEloRating(),
                    question.getBloomLevel(),
                    choices
            ));
        }
        return generated;
    }

    private BloomLevel inferBloom(String stem, QuestionType type) {
        if (stem.contains("chứng minh") || stem.contains("analyze") || stem.contains("phân tích")) {
            return BloomLevel.ANALYZE;
        }
        if (stem.contains("đánh giá") || stem.contains("evaluate")) {
            return BloomLevel.EVALUATE;
        }
        if (type == QuestionType.ESSAY) {
            return BloomLevel.APPLY;
        }
        if (type == QuestionType.SHORT_ANSWER) {
            return BloomLevel.UNDERSTAND;
        }
        return BloomLevel.REMEMBER;
    }

    private Difficulty inferDifficulty(String stem, QuestionType type, int currentElo) {
        if (currentElo >= 1500 || type == QuestionType.ESSAY || stem.length() > 400) {
            return Difficulty.EXPERT;
        }
        if (currentElo >= 1300 || stem.length() > 220) {
            return Difficulty.ADVANCED;
        }
        if (currentElo >= 1100) {
            return Difficulty.INTERMEDIATE;
        }
        return Difficulty.BEGINNER;
    }

    private String normalize(String value) {
        if (value == null) {
            return "";
        }
        String decomposed = Normalizer.normalize(value, Normalizer.Form.NFD).replaceAll("\\p{M}", "");
        return decomposed.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", "");
    }
}
