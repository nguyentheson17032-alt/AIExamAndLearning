package com.aiexam.learning.ai.domain;

import com.aiexam.learning.common.config.AiProperties;
import com.aiexam.learning.question.domain.BloomLevel;
import com.aiexam.learning.question.domain.Difficulty;
import com.aiexam.learning.question.domain.Question;
import com.aiexam.learning.question.domain.QuestionType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.core.io.ClassPathResource;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Slf4j
@RequiredArgsConstructor
public class SpringAiExamClient implements ExamAiClient {

    private final ChatClient chatClient;
    private final AiProperties properties;
    private final HeuristicExamAiClient fallback;

    @Override
    public ClassificationResult classify(Question question) {
        try {
            ClassifyAi result = chatClient.prompt()
                    .user(u -> u.text(load("prompts/classify-question.st"))
                            .param("subject", question.getSubject().getCode())
                            .param("type", question.getType().name())
                            .param("stem", question.getStem())
                            .param("difficulty", question.getDifficulty().name())
                            .param("elo", question.getEloRating()))
                    .call()
                    .entity(ClassifyAi.class);
            return new ClassificationResult(
                    result.tags() == null ? List.of() : result.tags(),
                    parseDifficulty(result.difficulty(), question.getDifficulty()),
                    result.eloRating(),
                    result.category(),
                    parseBloom(result.bloomLevel(), question.getBloomLevel()),
                    BigDecimal.valueOf(result.confidence()).setScale(4, RoundingMode.HALF_UP),
                    properties.modelName()
            );
        } catch (RuntimeException ex) {
            log.warn("AI classify failed, using heuristic: {}", ex.getMessage());
            return fallback.classify(question);
        }
    }

    @Override
    public GradeResult grade(Question question, String answer, BigDecimal maxPoints) {
        try {
            GradeAi result = chatClient.prompt()
                    .user(u -> u.text(load("prompts/grade-answer.st"))
                            .param("maxPoints", maxPoints)
                            .param("type", question.getType().name())
                            .param("stem", question.getStem())
                            .param("answerKey", question.getAnswerKey() == null ? "" : question.getAnswerKey())
                            .param("answer", answer == null ? "" : answer))
                    .call()
                    .entity(GradeAi.class);
            return new GradeResult(
                    result.correct(),
                    BigDecimal.valueOf(result.score()).setScale(2, RoundingMode.HALF_UP),
                    result.feedback(),
                    properties.modelName()
            );
        } catch (RuntimeException ex) {
            log.warn("AI grade failed, using heuristic: {}", ex.getMessage());
            return fallback.grade(question, answer, maxPoints);
        }
    }

    @Override
    public EloSuggestion suggestElo(int currentElo, int paperElo, double scoreRatio, String summary) {
        try {
            EloAi result = chatClient.prompt()
                    .user(u -> u.text(load("prompts/adjust-elo.st"))
                            .param("currentElo", currentElo)
                            .param("paperElo", paperElo)
                            .param("scoreRatio", scoreRatio)
                            .param("summary", summary))
                    .call()
                    .entity(EloAi.class);
            return new EloSuggestion(result.suggestedElo(), result.rationale(), properties.modelName());
        } catch (RuntimeException ex) {
            log.warn("AI elo failed, using heuristic: {}", ex.getMessage());
            return fallback.suggestElo(currentElo, paperElo, scoreRatio, summary);
        }
    }

    @Override
    public List<GeneratedQuestion> generateSimilar(Question question, int count) {
        try {
            SimilarAi result = chatClient.prompt()
                    .user(u -> u.text(load("prompts/generate-similar.st"))
                            .param("count", count)
                            .param("type", question.getType().name())
                            .param("stem", question.getStem())
                            .param("answerKey", question.getAnswerKey() == null ? "" : question.getAnswerKey())
                            .param("difficulty", question.getDifficulty().name())
                            .param("elo", question.getEloRating()))
                    .call()
                    .entity(SimilarAi.class);
            if (result.questions() == null || result.questions().isEmpty()) {
                return fallback.generateSimilar(question, count);
            }
            return result.questions().stream()
                    .map(item -> new GeneratedQuestion(
                            parseType(item.type(), question.getType()),
                            item.stem(),
                            item.answerKey(),
                            item.explanation(),
                            parseDifficulty(item.difficulty(), question.getDifficulty()),
                            item.eloRating(),
                            parseBloom(item.bloomLevel(), question.getBloomLevel()),
                            item.choices() == null ? List.of() : item.choices().stream()
                                    .map(choice -> new GeneratedChoice(choice.label(), choice.content(), choice.correct()))
                                    .toList()
                    ))
                    .toList();
        } catch (RuntimeException ex) {
            log.warn("AI similar-question failed, using heuristic: {}", ex.getMessage());
            return fallback.generateSimilar(question, count);
        }
    }

    private String load(String path) {
        try {
            return new ClassPathResource(path).getContentAsString(StandardCharsets.UTF_8);
        } catch (Exception ex) {
            throw new IllegalStateException("Missing prompt " + path, ex);
        }
    }

    private Difficulty parseDifficulty(String value, Difficulty fallbackValue) {
        if (value == null) {
            return fallbackValue == null ? Difficulty.INTERMEDIATE : fallbackValue;
        }
        try {
            return Difficulty.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            return fallbackValue == null ? Difficulty.INTERMEDIATE : fallbackValue;
        }
    }

    private BloomLevel parseBloom(String value, BloomLevel fallbackValue) {
        if (value == null) {
            return fallbackValue == null ? BloomLevel.UNDERSTAND : fallbackValue;
        }
        try {
            return BloomLevel.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            return fallbackValue == null ? BloomLevel.UNDERSTAND : fallbackValue;
        }
    }

    private QuestionType parseType(String value, QuestionType fallbackValue) {
        if (value == null) {
            return fallbackValue;
        }
        try {
            return QuestionType.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            return fallbackValue;
        }
    }

    public record ClassifyAi(
            List<String> tags,
            String difficulty,
            int eloRating,
            String category,
            String bloomLevel,
            double confidence
    ) {}

    public record GradeAi(boolean correct, double score, String feedback) {}

    public record EloAi(int suggestedElo, String rationale) {}

    public record SimilarChoiceAi(String label, String content, boolean correct) {}

    public record GeneratedQuestionAi(
            String type,
            String stem,
            String answerKey,
            String explanation,
            String difficulty,
            int eloRating,
            String bloomLevel,
            List<SimilarChoiceAi> choices
    ) {}

    public record SimilarAi(List<GeneratedQuestionAi> questions) {}
}
