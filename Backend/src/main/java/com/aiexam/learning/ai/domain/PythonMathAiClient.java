package com.aiexam.learning.ai.domain;

import com.aiexam.learning.common.config.AiProperties;
import com.aiexam.learning.question.domain.BloomLevel;
import com.aiexam.learning.question.domain.Difficulty;
import com.aiexam.learning.question.domain.Question;
import com.aiexam.learning.question.domain.QuestionType;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
public class PythonMathAiClient implements ExamAiClient {

    private final RestClient restClient;
    private final AiProperties properties;
    private final HeuristicExamAiClient fallback;
    private final ObjectMapper objectMapper;

    public PythonMathAiClient(AiProperties properties, HeuristicExamAiClient fallback, ObjectMapper objectMapper) {
        this.properties = properties;
        this.fallback = fallback;
        this.objectMapper = objectMapper;
        var requestFactory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(java.time.Duration.ofSeconds(5));
        requestFactory.setReadTimeout(java.time.Duration.ofSeconds(15));
        this.restClient = RestClient.builder()
                .requestFactory(requestFactory)
                .baseUrl(properties.mathServiceUrl())
                .build();
    }

    @Override
    public ClassificationResult classify(Question question) {
        try {
            var body = Map.of("stem", question.getStem());
            String responseStr = restClient.post()
                    .uri("/api/ai/classify")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(String.class);

            if (responseStr != null) {
                JsonNode root = objectMapper.readTree(responseStr);
                if (root.path("success").asBoolean(false)) {
                    JsonNode data = root.path("data");
                    List<String> tags = new ArrayList<>();
                    data.path("tags").forEach(t -> tags.add(t.asText()));
                    String diffText = data.path("difficulty").asText("INTERMEDIATE").toUpperCase();
                    Difficulty difficulty = Difficulty.INTERMEDIATE;
                    if (diffText.contains("EASY") || diffText.contains("BEGINNER")) difficulty = Difficulty.BEGINNER;
                    else if (diffText.contains("HARD") || diffText.contains("ADVANCED") || diffText.contains("EXPERT")) difficulty = Difficulty.ADVANCED;

                    int elo = data.path("eloRating").asInt(1000);
                    String category = data.path("category").asText("Toán học");
                    String bloomText = data.path("bloomLevel").asText("UNDERSTAND").toUpperCase();
                    BloomLevel bloom = BloomLevel.UNDERSTAND;
                    try {
                        bloom = BloomLevel.valueOf(bloomText);
                    } catch (Exception ignored) {}
                    BigDecimal conf = BigDecimal.valueOf(data.path("confidence").asDouble(0.95));
                    String modelName = data.path("modelName").asText("TrainAiMath-Engine");
                    return new ClassificationResult(tags, difficulty, elo, category, bloom, conf, modelName);

                }
            }
        } catch (Exception ex) {
            log.warn("Python Math AI classify failed, falling back to heuristic: {}", ex.getMessage());
        }
        return fallback.classify(question);
    }

    @Override
    public GradeResult grade(Question question, String answer, BigDecimal maxPoints) {
        try {
            var probMap = Map.of(
                    "id", question.getId().toString(),
                    "question", question.getStem(),
                    "final_answer", question.getAnswerKey() == null ? "" : question.getAnswerKey(),
                    "numeric_answer", question.getAnswerKey() == null ? "" : question.getAnswerKey(),
                    "solution", question.getExplanation() == null ? "" : question.getExplanation()
            );
            var reqBody = Map.of(
                    "problem", probMap,
                    "user_answer", answer == null ? "" : answer
            );
            String responseStr = restClient.post()
                    .uri("/api/evaluate")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(reqBody)
                    .retrieve()
                    .body(String.class);

            if (responseStr != null) {
                JsonNode root = objectMapper.readTree(responseStr);
                if (root.path("success").asBoolean(false)) {
                    JsonNode res = root.path("result");
                    boolean isCorrect = res.path("is_correct").asBoolean();
                    int scorePct = res.path("score").asInt(isCorrect ? 100 : 0);
                    String feedback = res.path("feedback").asText();
                    BigDecimal score = maxPoints.multiply(BigDecimal.valueOf(scorePct))
                            .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                    return new GradeResult(isCorrect, score, feedback, "TrainAiMath-Evaluator");
                }
            }
        } catch (Exception ex) {
            log.warn("Python Math AI grade failed, falling back to heuristic: {}", ex.getMessage());
        }
        return fallback.grade(question, answer, maxPoints);
    }

    @Override
    public EloSuggestion suggestElo(int currentElo, int paperElo, double scoreRatio, String summary) {
        return fallback.suggestElo(currentElo, paperElo, scoreRatio, summary);
    }

    @Override
    public List<GeneratedQuestion> generateSimilar(Question question, int count) {
        try {
            var reqBody = Map.of("stem", question.getStem(), "count", count);
            String responseStr = restClient.post()
                    .uri("/api/ai/similar")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(reqBody)
                    .retrieve()
                    .body(String.class);

            if (responseStr != null) {
                JsonNode root = objectMapper.readTree(responseStr);
                if (root.path("success").asBoolean(false)) {
                    JsonNode exList = root.path("exercises");
                    List<GeneratedQuestion> result = new ArrayList<>();
                    for (JsonNode item : exList) {
                        result.add(mapJsonToGeneratedQuestion(item));
                    }
                    if (!result.isEmpty()) {
                        return result;
                    }
                }
            }
        } catch (Exception ex) {
            log.warn("Python Math AI generateSimilar failed, falling back to heuristic: {}", ex.getMessage());
        }
        return fallback.generateSimilar(question, count);
    }

    public List<GeneratedQuestion> generateBatch(String category, String difficulty, int count, String subjectName) {
        try {
            Map<String, Object> reqBody = new HashMap<>();
            reqBody.put("category", category == null ? "all" : category);
            reqBody.put("difficulty", difficulty == null ? "medium" : difficulty.toLowerCase());
            reqBody.put("count", count);
            if (subjectName != null && !subjectName.isBlank()) {
                reqBody.put("subject_name", subjectName);
            }
            String responseStr = restClient.post()
                    .uri("/api/generate")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(reqBody)
                    .retrieve()
                    .body(String.class);

            if (responseStr != null) {
                JsonNode root = objectMapper.readTree(responseStr);
                if (root.path("success").asBoolean(false)) {
                    JsonNode exList = root.path("exercises");
                    List<GeneratedQuestion> result = new ArrayList<>();
                    for (JsonNode item : exList) {
                        result.add(mapJsonToGeneratedQuestion(item));
                    }
                    return result;
                }
            }
        } catch (Exception ex) {
            log.error("Failed to generate math batch from Python server: {}", ex.getMessage());
        }
        return List.of();
    }

    public List<GeneratedQuestion> generateBatch(String category, String difficulty, int count) {
        return generateBatch(category, difficulty, count, null);
    }

    public Map<String, Object> generateExercises(String category, String difficulty, int count, Integer elo, String subjectName) {
        try {
            Map<String, Object> reqBody = new HashMap<>();
            reqBody.put("category", category == null ? "all" : category);
            reqBody.put("difficulty", difficulty == null ? "medium" : difficulty.toLowerCase());
            reqBody.put("count", count);
            if (elo != null) reqBody.put("elo", elo);
            if (subjectName != null) reqBody.put("subject_name", subjectName);

            String responseStr = restClient.post()
                    .uri("/api/generate")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(reqBody)
                    .retrieve()
                    .body(String.class);

            if (responseStr != null) {
                return objectMapper.readValue(responseStr, new TypeReference<Map<String, Object>>() {});
            }
        } catch (Exception ex) {
            log.warn("Python Math AI generate failed: {}", ex.getMessage());
        }
        return Map.of("success", false, "exercises", List.of());
    }

    public String chatTutor(String query, Object currentProblem) {
        try {
            var reqBody = Map.of(
                    "query", query == null ? "" : query,
                    "current_problem", currentProblem == null ? Map.of() : currentProblem
            );
            String responseStr = restClient.post()
                    .uri("/api/ai/chat")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(reqBody)
                    .retrieve()
                    .body(String.class);

            if (responseStr != null) {
                JsonNode root = objectMapper.readTree(responseStr);
                if (root.path("success").asBoolean(false)) {
                    return root.path("reply").asText();
                }
            }
        } catch (Exception ex) {
            log.warn("Python Math AI Tutor chat failed: {}", ex.getMessage());
        }
        return "Xin lỗi, hiện tại Trợ lý AI Math Tutor đang bận. Bạn hãy thử lại sau ít phút nhé!";
    }

    public Map<String, Object> evaluateAnswer(Object problem, String userAnswer) {
        try {
            var reqBody = Map.of(
                    "problem", problem == null ? Map.of() : problem,
                    "user_answer", userAnswer == null ? "" : userAnswer
            );
            String responseStr = restClient.post()
                    .uri("/api/evaluate")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(reqBody)
                    .retrieve()
                    .body(String.class);

            if (responseStr != null) {
                return objectMapper.readValue(responseStr, new TypeReference<Map<String, Object>>() {});
            }
        } catch (Exception ex) {
            log.warn("Python Math AI evaluate failed: {}", ex.getMessage());
        }
        return Map.of("success", false, "message", "Không thể kết nối dịch vụ AI Math Evaluator");
    }

    public Map<String, Object> predictModels(Double x) {
        try {
            double xVal = x == null ? 2.0 : x;
            String responseStr = restClient.get()
                    .uri("/api/ai/predict?x={x}", xVal)
                    .retrieve()
                    .body(String.class);

            if (responseStr != null) {
                return objectMapper.readValue(responseStr, new TypeReference<Map<String, Object>>() {});
            }
        } catch (Exception ex) {
            log.warn("Python Math AI predict failed: {}", ex.getMessage());
        }
        return Map.of("success", false, "message", "Không thể kết nối dịch vụ dự đoán AI PyTorch");
    }

    private GeneratedQuestion mapJsonToGeneratedQuestion(JsonNode item) {
        String stem = item.path("question").asText();
        String explanation = item.path("solution").asText();
        String answerKey = item.path("final_answer").asText();
        String diffStr = item.path("difficulty").asText("medium").toUpperCase();
        Difficulty difficulty = Difficulty.INTERMEDIATE;
        if (diffStr.contains("EASY") || diffStr.contains("BEGINNER")) {
            difficulty = Difficulty.BEGINNER;
        } else if (diffStr.contains("HARD") || diffStr.contains("ADVANCED") || diffStr.contains("EXPERT")) {
            difficulty = Difficulty.ADVANCED;
        }

        int elo = difficulty == Difficulty.ADVANCED ? 1200 : (difficulty == Difficulty.BEGINNER ? 900 : 1050);
        BloomLevel bloom = difficulty == Difficulty.ADVANCED ? BloomLevel.APPLY : BloomLevel.UNDERSTAND;

        List<GeneratedChoice> choices = new ArrayList<>();
        JsonNode options = item.path("options");
        int correctOptIdx = item.path("correct_option").asInt(-1);
        if (options.isArray() && options.size() > 0) {
            for (int i = 0; i < options.size(); i++) {
                String label = String.valueOf((char) ('A' + i));
                String content = options.get(i).asText();
                boolean correct = (i == correctOptIdx);
                choices.add(new GeneratedChoice(label, content, correct));
            }
            return new GeneratedQuestion(
                    QuestionType.MULTIPLE_CHOICE,
                    stem,
                    answerKey,
                    explanation,
                    difficulty,
                    elo,
                    bloom,
                    choices
            );
        } else {
            return new GeneratedQuestion(
                    QuestionType.SHORT_ANSWER,
                    stem,
                    answerKey,
                    explanation,
                    difficulty,
                    elo,
                    bloom,
                    List.of()
            );
        }
    }
}

