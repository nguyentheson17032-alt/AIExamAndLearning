package com.aiexam.learning.ai.domain;

import com.aiexam.learning.ai.api.AiJobResponse;
import com.aiexam.learning.ai.api.PracticeGenerateRequest;
import com.aiexam.learning.ai.infrastructure.AiGenerationJobRepository;
import com.aiexam.learning.attempt.domain.Attempt;
import com.aiexam.learning.attempt.domain.AttemptService;
import com.aiexam.learning.common.exception.ResourceNotFoundException;
import com.aiexam.learning.elo.domain.EloCalculator;
import com.aiexam.learning.elo.domain.EloReason;
import com.aiexam.learning.elo.domain.EloService;
import com.aiexam.learning.paper.api.PaperResponse;
import com.aiexam.learning.paper.domain.PaperService;
import com.aiexam.learning.question.api.ChoiceRequest;
import com.aiexam.learning.question.api.QuestionCreateRequest;
import com.aiexam.learning.question.api.QuestionResponse;
import com.aiexam.learning.question.domain.ContentStatus;
import com.aiexam.learning.question.domain.Question;
import com.aiexam.learning.question.domain.QuestionClassification;
import com.aiexam.learning.question.domain.QuestionService;
import com.aiexam.learning.question.domain.QuestionSource;
import com.aiexam.learning.question.domain.QuestionType;
import com.aiexam.learning.question.infrastructure.QuestionClassificationRepository;
import com.aiexam.learning.user.api.UserProfileResponse;
import com.aiexam.learning.user.domain.User;
import com.aiexam.learning.user.infrastructure.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.aiexam.learning.catalog.domain.Subject;
import com.aiexam.learning.catalog.infrastructure.SubjectRepository;
import com.aiexam.learning.paper.domain.Paper;
import com.aiexam.learning.paper.domain.PaperKind;
import com.aiexam.learning.paper.domain.PaperSource;
import com.aiexam.learning.paper.domain.PaperSet;
import com.aiexam.learning.paper.infrastructure.PaperRepository;
import com.aiexam.learning.paper.infrastructure.PaperSetRepository;
import com.aiexam.learning.question.domain.BloomLevel;
import com.aiexam.learning.question.domain.Difficulty;
import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiExamService {

    private final ExamAiClient examAiClient;
    private final PythonMathAiClient pythonMathAiClient;
    private final PythonPhysicsAiClient pythonPhysicsAiClient;
    private final QuestionService questionService;
    private final QuestionClassificationRepository classificationRepository;
    private final PaperService paperService;
    private final PaperRepository paperRepository;
    private final PaperSetRepository paperSetRepository;
    private final SubjectRepository subjectRepository;
    private final AttemptService attemptService;
    private final EloService eloService;
    private final UserRepository userRepository;
    private final AiGenerationJobRepository jobRepository;
    private final ObjectMapper objectMapper;

    private boolean isPhysics(String subjectName, String category) {
        if (category != null) {
            String c = category.toLowerCase(Locale.ROOT);
            if (c.startsWith("phy") || c.equals("mechanics") || c.equals("oscillation_wave") ||
                    c.equals("circuits_electromagnetism") || c.equals("optics") || c.equals("thermodynamics") ||
                    c.equals("nuclear_quantum") || c.contains("vật") || c.contains("vat") || c.contains("cơ học")) {
                return true;
            }
        }
        if (subjectName != null) {
            String s = subjectName.toLowerCase(Locale.ROOT);
            return s.contains("vật") || s.contains("vat") || s.contains("phys") || s.contains("lý") ||
                    s.contains("ly") || s.contains("lí") || s.contains("li") || s.contains("phy");
        }
        return false;
    }


    public String chatTutor(String query, Object currentProblem) {
        boolean isPhy = false;
        if (query != null && (query.toLowerCase(Locale.ROOT).contains("vật lý") || query.toLowerCase(Locale.ROOT).contains("physics") ||
                query.toLowerCase(Locale.ROOT).contains("sóng") || query.toLowerCase(Locale.ROOT).contains("lò xo") ||
                query.toLowerCase(Locale.ROOT).contains("tổng trở") || query.toLowerCase(Locale.ROOT).contains("thấu kính"))) {
            isPhy = true;
        }
        if (currentProblem instanceof Map<?, ?> m) {
            Object sName = m.get("subject_name");
            Object cat = m.get("category");
            if (sName != null && (sName.toString().toLowerCase(Locale.ROOT).contains("vật") || sName.toString().toLowerCase(Locale.ROOT).contains("phys"))) isPhy = true;
            if (cat != null && isPhysics(null, cat.toString())) isPhy = true;
        }
        if (isPhy) {
            return pythonPhysicsAiClient.chatTutor(query, currentProblem);
        }
        return pythonMathAiClient.chatTutor(query, currentProblem);
    }

    public java.util.Map<String, Object> evaluateMath(Object problem, String userAnswer) {
        boolean isPhy = false;
        if (problem instanceof Map<?, ?> m) {
            Object sName = m.get("subject_name");
            Object cat = m.get("category");
            if (sName != null && (sName.toString().toLowerCase(Locale.ROOT).contains("vật") || sName.toString().toLowerCase(Locale.ROOT).contains("phys"))) isPhy = true;
            if (cat != null && isPhysics(null, cat.toString())) isPhy = true;
        }
        if (isPhy) {
            return pythonPhysicsAiClient.evaluateAnswer(problem, userAnswer);
        }
        return pythonMathAiClient.evaluateAnswer(problem, userAnswer);
    }

    public java.util.Map<String, Object> predictModels(Double x) {
        return pythonMathAiClient.predictModels(x);
    }

    @Transactional
    public java.util.Map<String, Object> generateMathExercises(UUID userId, String category, String difficulty, int count, Integer elo, String subjectName) {
        boolean isPhy = isPhysics(subjectName, category);
        Map<String, Object> aiResult;
        if (isPhy) {
            aiResult = pythonPhysicsAiClient.generateExercises(category, difficulty, count, elo, "Vật lý");
        } else {
            aiResult = pythonMathAiClient.generateExercises(category, difficulty, count, elo, subjectName);
        }

        if (aiResult == null || !Boolean.TRUE.equals(aiResult.get("success"))) {
            return aiResult != null ? aiResult : Map.of("success", false, "exercises", List.of());
        }

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> exercises = (List<Map<String, Object>>) aiResult.get("exercises");
        if (exercises == null || exercises.isEmpty()) {
            return aiResult;
        }

        try {
            Subject subject = null;
            if (isPhy) {
                subject = subjectRepository.findByNameIgnoreCase("Vật lý")
                        .or(() -> subjectRepository.findByNameIgnoreCase("Vật lí"))
                        .or(() -> subjectRepository.findByCode("PHYSICS"))
                        .or(() -> subjectRepository.findByCode("PHYS"))
                        .orElseGet(() -> subjectRepository.save(Subject.create("PHYSICS", "Vật lý", "Môn học Vật lý THPT và Luyện thi đại học")));
            } else {
                if (subjectName != null && !subjectName.isBlank()) {
                    subject = subjectRepository.findByNameIgnoreCase(subjectName.trim())
                            .or(() -> subjectRepository.findByCode(subjectName.trim().toUpperCase()))
                            .orElse(null);
                }
                if (subject == null) {
                    subject = subjectRepository.findFirstByOrderByNameAsc().orElse(null);
                }
            }

            if (subject != null) {
                User author = userId != null ? userRepository.findById(userId).orElse(null) : null;
                if (author == null) {
                    author = userRepository.findAll().stream().findFirst().orElse(null);
                }

                if (author != null) {
                    int eloVal = elo != null ? elo : 1050;
                    String diffStr = difficulty != null ? difficulty.toUpperCase() : "MEDIUM";
                    String catName = mapCategoryName(category);

                    // Find or create PaperSet for this subject
                    String setTitle = "Bộ đề luyện tập AI - " + subject.getName();
                    final User finalAuthor = author;
                    final Subject finalSubject = subject;
                    PaperSet paperSet = paperSetRepository.findFirstBySubject_IdAndTitle(subject.getId(), setTitle)
                            .orElseGet(() -> {
                                PaperSet newSet = PaperSet.create(
                                        finalAuthor,
                                        finalSubject,
                                        setTitle,
                                        "2025 - 2026",
                                        "Tổng hợp các đề luyện tập và kiểm tra sinh tự động bởi AI Math Engine.",
                                        ContentStatus.PUBLISHED
                                );
                                return paperSetRepository.save(newSet);
                            });

                    int examNumber = (int) paperRepository.countByPaperSetId(paperSet.getId()) + 1;
                    String paperTitle = "Đề số " + examNumber + ": " + catName + " (" + diffStr + " " + eloVal + " Elo)";
                    String paperDesc = "Đề luyện tập sinh tự động bởi AI Engine gồm " + exercises.size() + " câu hỏi dạng " + catName + ".";

                    Paper paper = Paper.create(
                            author,
                            subject,
                            paperTitle,
                            paperDesc,
                            PaperKind.PRACTICE,
                            PaperSource.AI_GENERATED,
                            AiPracticeRules.durationMinutes(exercises.size()),
                            Math.max(100, eloVal - 150),
                            eloVal + 150,
                            ContentStatus.PUBLISHED
                    );
                    paper.assignToSet(paperSet, examNumber);

                    int sortOrder = 1;
                    BigDecimal pointsPerQ = BigDecimal.valueOf(10.0 / exercises.size())
                            .setScale(2, RoundingMode.HALF_UP);

                    for (Map<String, Object> ex : exercises) {
                        String stem = (String) ex.get("question");
                        String explanation = (String) ex.get("solution");
                        String finalAnswer = (String) ex.get("final_answer");
                        if (finalAnswer == null || finalAnswer.isBlank()) {
                            finalAnswer = (String) ex.get("answer");
                        }

                        @SuppressWarnings("unchecked")
                        List<String> options = (List<String>) ex.get("options");
                        QuestionType qType = (options != null && !options.isEmpty()) ? QuestionType.MULTIPLE_CHOICE : QuestionType.SHORT_ANSWER;

                        Difficulty qDiff = Difficulty.INTERMEDIATE;
                        if ("easy".equalsIgnoreCase(difficulty)) qDiff = Difficulty.BEGINNER;
                        else if ("hard".equalsIgnoreCase(difficulty)) qDiff = Difficulty.ADVANCED;

                        List<ChoiceRequest> choices = new ArrayList<>();
                        if (options != null && !options.isEmpty()) {
                            int correctOptIdx = -1;
                            if (ex.get("correct_option") instanceof Number n) {
                                correctOptIdx = n.intValue();
                            }
                            for (int i = 0; i < options.size(); i++) {
                                String label = String.valueOf((char) ('A' + i));
                                String optText = options.get(i);
                                boolean isCorrect = (i == correctOptIdx) ||
                                        (finalAnswer != null && (finalAnswer.equalsIgnoreCase(label) || finalAnswer.trim().equalsIgnoreCase(optText.trim())));
                                choices.add(new ChoiceRequest(label, optText, isCorrect));
                            }
                            if (choices.stream().noneMatch(ChoiceRequest::correct)) {
                                choices.set(0, new ChoiceRequest(choices.get(0).label(), choices.get(0).content(), true));
                            }
                        }

                        QuestionCreateRequest qReq = new QuestionCreateRequest(
                                subject.getId(),
                                null,
                                qType,
                                stem != null ? stem : "Câu hỏi toán AI",
                                finalAnswer != null ? finalAnswer : "",
                                explanation != null ? explanation : "",
                                qDiff,
                                eloVal,
                                BloomLevel.APPLY,
                                QuestionSource.AI_GENERATED,
                                ContentStatus.PUBLISHED,
                                choices
                        );

                        Question savedQ = questionService.saveGenerated(author.getId(), qReq, null);
                        paper.addQuestion(savedQ, sortOrder++, pointsPerQ);
                    }

                    Paper savedPaper = paperRepository.save(paper);
                    Map<String, Object> mutableResult = new HashMap<>(aiResult);
                    mutableResult.put("paperId", savedPaper.getId().toString());
                    mutableResult.put("paperTitle", savedPaper.getTitle());
                    mutableResult.put("paperSetId", paperSet.getId().toString());
                    mutableResult.put("paperSetTitle", paperSet.getTitle());
                    return mutableResult;
                }
            }
        } catch (Exception ex) {
            log.warn("Failed to persist AI practice paper to database: {}", ex.getMessage(), ex);
        }

        return aiResult;
    }

    private String mapCategoryName(String category) {
        if (category == null) return "Tổng hợp";
        return switch (category.toLowerCase(Locale.ROOT)) {
            case "linear" -> "Phương trình bậc 1";
            case "quadratic" -> "Phương trình bậc 2";
            case "system" -> "Hệ 2 phương trình bậc nhất";
            case "word_problem" -> "Toán thực tế / Lời văn";
            case "ai_challenge" -> "Thử thách AI Model";
            case "mechanics" -> "Cơ học & Động lực học";
            case "oscillation_wave" -> "Dao động & Sóng cơ";
            case "circuits_electromagnetism" -> "Điện học & Mạch xoay chiều";
            case "optics" -> "Quang học & Thấu kính";
            case "thermodynamics" -> "Nhiệt học & Khí lý tưởng";
            case "nuclear_quantum" -> "Lượng tử & Vật lý hạt nhân";
            default -> "Tổng hợp";
        };
    }

    @Transactional
    public List<QuestionResponse> generateMathToBank(UUID userId, com.aiexam.learning.ai.api.MathGenerateBankRequest request) {
        User user = user(userId);
        int count = request.count() == null ? 3 : Math.max(1, Math.min(request.count(), 20));
        AiGenerationJob job = jobRepository.save(
                AiGenerationJob.start(user, AiJobType.SIMILAR_QUESTION, "ai_bank:" + request.category() + ":" + count));
        try {
            Subject subject = null;
            if (request.subjectId() != null) {
                subject = subjectRepository.findById(request.subjectId()).orElse(null);
            }
            String subjectName = subject != null ? subject.getName() : "Toán học";
            boolean isPhy = (subject != null && isPhysics(subject.getName(), request.category())) || isPhysics(null, request.category());

            List<ExamAiClient.GeneratedQuestion> generated;
            if (isPhy) {
                generated = pythonPhysicsAiClient.generateBatch(
                        request.category(),
                        request.difficulty(),
                        count
                );
            } else {
                generated = pythonMathAiClient.generateBatch(
                        request.category(),
                        request.difficulty(),
                        count,
                        subjectName
                );
            }
            List<QuestionResponse> saved = new ArrayList<>();
            for (ExamAiClient.GeneratedQuestion item : generated) {
                QuestionCreateRequest createReq = new QuestionCreateRequest(
                        request.subjectId(),
                        request.topicId(),
                        item.type(),
                        item.stem(),
                        item.answerKey(),
                        item.explanation(),
                        item.difficulty(),
                        item.eloRating(),
                        item.bloomLevel(),
                        QuestionSource.AI_GENERATED,
                        ContentStatus.PUBLISHED,
                        choicesFor(item)
                );
                QuestionResponse persisted = questionService.create(userId, createReq);
                saved.add(persisted);

            }
            job.complete(writeJson(saved.stream().map(QuestionResponse::id).toList()));
            return saved;
        } catch (RuntimeException ex) {
            job.fail(ex.getMessage());
            throw ex;
        }
    }

    @Transactional
    public QuestionResponse classify(UUID userId, UUID questionId) {
        User user = user(userId);
        Question question = questionService.getQuestion(questionId);
        AiGenerationJob job = jobRepository.save(AiGenerationJob.start(user, AiJobType.CLASSIFY, questionId.toString()));
        try {
            ExamAiClient.ClassificationResult result = examAiClient.classify(question);
            classificationRepository.save(QuestionClassification.create(
                    question,
                    String.join(",", result.tags()),
                    result.difficulty(),
                    result.eloRating(),
                    result.category(),
                    result.bloomLevel(),
                    result.confidence(),
                    result.modelName()
            ));
            question.applyClassification(result.difficulty(), result.eloRating(), result.bloomLevel());
            job.complete(writeJson(result));
            return QuestionResponse.from(question);
        } catch (RuntimeException ex) {
            job.fail(ex.getMessage());
            throw ex;
        }
    }

    @Transactional
    public List<QuestionResponse> generateSimilar(UUID userId, UUID questionId, int count) {
        User user = user(userId);
        Question source = questionService.getQuestion(questionId);
        AiGenerationJob job = jobRepository.save(
                AiGenerationJob.start(user, AiJobType.SIMILAR_QUESTION, questionId + ":" + count));
        try {
            List<ExamAiClient.GeneratedQuestion> generated = examAiClient.generateSimilar(source, count);
            List<QuestionResponse> saved = new ArrayList<>();
            for (ExamAiClient.GeneratedQuestion item : generated) {
                QuestionCreateRequest request = new QuestionCreateRequest(
                        source.getSubject().getId(),
                        source.getTopic() == null ? null : source.getTopic().getId(),
                        item.type(),
                        item.stem(),
                        item.answerKey(),
                        item.explanation(),
                        item.difficulty(),
                        item.eloRating(),
                        item.bloomLevel(),
                        QuestionSource.AI_GENERATED,
                        ContentStatus.PUBLISHED,
                        choicesFor(item)
                );
                Question persisted = questionService.saveGenerated(userId, request, source);
                saved.add(QuestionResponse.from(persisted));
            }
            job.complete(writeJson(saved.stream().map(QuestionResponse::id).toList()));
            return saved;
        } catch (RuntimeException ex) {
            job.fail(ex.getMessage());
            throw ex;
        }
    }

    @Transactional
    public PaperResponse generatePracticePaper(UUID userId, PracticeGenerateRequest request) {
        User user = user(userId);
        int count = AiPracticeRules.clampQuestionCount(request.questionCount());
        int duration = AiPracticeRules.durationMinutes(count);
        AiGenerationJob job = jobRepository.save(
                AiGenerationJob.start(user, AiJobType.PRACTICE_PAPER, writeJson(request)));
        try {
            PaperResponse paper = paperService.generateBankPractice(
                    userId,
                    request.subjectId(),
                    "AI luyện thi Elo " + user.getEloRating(),
                    "Random published bank questions for rank " + user.getRankCode(),
                    count,
                    duration,
                    100,
                    3000
            );
            job.complete(paper.id().toString());
            return paper;
        } catch (RuntimeException ex) {
            job.fail(ex.getMessage());
            throw ex;
        }
    }

    @Transactional
    public UserProfileResponse adjustElo(UUID userId, UUID attemptId) {
        User user = user(userId);
        Attempt attempt = attemptService.getAttempt(attemptId);
        if (!attempt.getUser().getId().equals(userId)) {
            throw new com.aiexam.learning.common.exception.BusinessRuleException(
                    "ATTEMPT_FORBIDDEN", "Attempt does not belong to the current user");
        }
        if (attempt.getPaper().getPaperSet() != null) {
            throw new com.aiexam.learning.common.exception.BusinessRuleException(
                    "ELO_LOCKED_TO_SCORE",
                    "Exam-set Elo is awarded from the exam score and cannot be adjusted by AI");
        }
        AiGenerationJob job = jobRepository.save(AiGenerationJob.start(user, AiJobType.ELO, attemptId.toString()));
        try {
            int paperElo = EloCalculator.paperRating(
                    attempt.getPaper().getTargetEloMin(),
                    attempt.getPaper().getTargetEloMax());
            double ratio = 0;
            if (attempt.getScore() != null && attempt.getMaxScore() != null && attempt.getMaxScore().signum() > 0) {
                ratio = attempt.getScore().doubleValue() / attempt.getMaxScore().doubleValue();
            }
            ExamAiClient.EloSuggestion suggestion = examAiClient.suggestElo(
                    user.getEloRating(),
                    paperElo,
                    ratio,
                    "Attempt " + attemptId + " score=" + attempt.getScore()
            );
            eloService.applyAdjustment(user, attempt, suggestion.suggestedElo(), EloReason.AI_ADJUSTMENT);
            job.complete(writeJson(suggestion));
            return UserProfileResponse.from(user);
        } catch (RuntimeException ex) {
            job.fail(ex.getMessage());
            throw ex;
        }
    }

    public AiJobResponse getJob(UUID id) {
        return AiJobResponse.from(jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AI_JOB_NOT_FOUND", "AI job not found: " + id)));
    }

    private List<ChoiceRequest> choicesFor(ExamAiClient.GeneratedQuestion item) {
        if (item.type() == QuestionType.TRUE_FALSE) {
            return trueFalseChoices(item);
        }
        List<ExamAiClient.GeneratedChoice> choices = item.choices() == null ? List.of() : item.choices();
        return choices.stream()
                .map(choice -> new ChoiceRequest(choice.label(), choice.content(), choice.correct()))
                .toList();
    }

    private List<ChoiceRequest> trueFalseChoices(ExamAiClient.GeneratedQuestion item) {
        boolean correctIsTrue = isTrueAnswer(item);
        return List.of(
                new ChoiceRequest("Đ", "Đúng", correctIsTrue),
                new ChoiceRequest("S", "Sai", !correctIsTrue)
        );
    }

    private boolean isTrueAnswer(ExamAiClient.GeneratedQuestion item) {
        if (item.choices() != null) {
            for (ExamAiClient.GeneratedChoice choice : item.choices()) {
                if (choice.correct() && isTrueLabel(choice.label(), choice.content())) {
                    return true;
                }
                if (choice.correct() && isFalseLabel(choice.label(), choice.content())) {
                    return false;
                }
            }
        }
        return isTrueLabel(item.answerKey(), item.answerKey());
    }

    private boolean isTrueLabel(String label, String content) {
        String value = ((label == null ? "" : label) + " " + (content == null ? "" : content))
                .toLowerCase(Locale.ROOT)
                .trim();
        return value.contains("đúng") || value.equals("đ") || value.equals("true") || value.equals("t");
    }

    private boolean isFalseLabel(String label, String content) {
        String value = ((label == null ? "" : label) + " " + (content == null ? "" : content))
                .toLowerCase(Locale.ROOT)
                .trim();
        return value.contains("sai") || value.equals("s") || value.equals("false") || value.equals("f");
    }

    private User user(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("USER_NOT_FOUND", "User not found: " + userId));
    }

    private String writeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException ex) {
            return String.valueOf(value);
        }
    }
}

