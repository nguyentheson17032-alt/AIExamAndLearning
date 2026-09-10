package com.aiexam.learning.ai.domain;

import com.aiexam.learning.ai.api.AiJobResponse;
import com.aiexam.learning.ai.api.PracticeGenerateRequest;
import com.aiexam.learning.ai.infrastructure.AiGenerationJobRepository;
import com.aiexam.learning.attempt.domain.Attempt;
import com.aiexam.learning.attempt.domain.AttemptService;
import com.aiexam.learning.common.exception.ResourceNotFoundException;
import com.aiexam.learning.elo.domain.EloReason;
import com.aiexam.learning.elo.domain.EloService;
import com.aiexam.learning.paper.api.PaperCreateRequest;
import com.aiexam.learning.paper.api.PaperQuestionRequest;
import com.aiexam.learning.paper.api.PaperResponse;
import com.aiexam.learning.paper.domain.PaperKind;
import com.aiexam.learning.paper.domain.PaperService;
import com.aiexam.learning.paper.domain.PaperSource;
import com.aiexam.learning.question.api.ChoiceRequest;
import com.aiexam.learning.question.api.QuestionCreateRequest;
import com.aiexam.learning.question.api.QuestionResponse;
import com.aiexam.learning.question.domain.ContentStatus;
import com.aiexam.learning.question.domain.Question;
import com.aiexam.learning.question.domain.QuestionClassification;
import com.aiexam.learning.question.domain.QuestionService;
import com.aiexam.learning.question.domain.QuestionSource;
import com.aiexam.learning.question.infrastructure.QuestionClassificationRepository;
import com.aiexam.learning.question.infrastructure.QuestionRepository;
import com.aiexam.learning.user.api.UserProfileResponse;
import com.aiexam.learning.user.domain.User;
import com.aiexam.learning.user.infrastructure.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AiExamService {

    private final ExamAiClient examAiClient;
    private final QuestionService questionService;
    private final QuestionRepository questionRepository;
    private final QuestionClassificationRepository classificationRepository;
    private final PaperService paperService;
    private final AttemptService attemptService;
    private final EloService eloService;
    private final UserRepository userRepository;
    private final AiGenerationJobRepository jobRepository;
    private final ObjectMapper objectMapper;

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
                        item.choices().stream()
                                .map(choice -> new ChoiceRequest(choice.label(), choice.content(), choice.correct()))
                                .toList()
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
        int count = request.questionCount() == null ? 8 : request.questionCount();
        int duration = request.durationMinutes() == null ? 25 : request.durationMinutes();
        AiGenerationJob job = jobRepository.save(
                AiGenerationJob.start(user, AiJobType.PRACTICE_PAPER, writeJson(request)));
        try {
            int min = Math.max(100, user.getEloRating() - 80);
            int max = user.getEloRating() + 160;
            List<Question> seeds = questionRepository.findPublishedInEloRange(
                    request.subjectId(), ContentStatus.PUBLISHED, min, max);
            if (seeds.isEmpty()) {
                seeds = questionRepository.findPublishedInEloRange(
                        request.subjectId(), ContentStatus.PUBLISHED, 100, 3000);
            }
            if (seeds.isEmpty()) {
                throw new com.aiexam.learning.common.exception.BusinessRuleException(
                        "NO_PRACTICE_QUESTIONS", "No questions available to seed AI practice papers");
            }
            Question seed = seeds.getFirst();
            List<QuestionResponse> similar = generateSimilar(userId, seed.getId(), Math.max(1, count - 1));
            List<PaperQuestionRequest> items = new ArrayList<>();
            items.add(new PaperQuestionRequest(seed.getId(), BigDecimal.ONE));
            similar.stream().limit(count - 1L)
                    .forEach(question -> items.add(new PaperQuestionRequest(question.id(), BigDecimal.ONE)));
            PaperResponse paper = paperService.create(userId, new PaperCreateRequest(
                    request.subjectId(),
                    "AI luyện thi Elo " + user.getEloRating(),
                    "Generated practice set aimed just above current rank " + user.getRankCode(),
                    PaperKind.PRACTICE,
                    PaperSource.AI_GENERATED,
                    duration,
                    min,
                    max,
                    ContentStatus.PUBLISHED,
                    items
            ));
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
        AiGenerationJob job = jobRepository.save(AiGenerationJob.start(user, AiJobType.ELO, attemptId.toString()));
        try {
            int paperElo = attempt.getPaper().getItems().stream()
                    .mapToInt(item -> item.getQuestion().getEloRating())
                    .sum() / Math.max(1, attempt.getPaper().getItems().size());
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
