package com.aiexam.learning.attempt.domain;

import com.aiexam.learning.ai.domain.ExamAiClient;
import com.aiexam.learning.attempt.api.AnswerSubmitRequest;
import com.aiexam.learning.attempt.api.AttemptResponse;
import com.aiexam.learning.attempt.api.AttemptSolutionResponse;
import com.aiexam.learning.attempt.api.AttemptSubmitRequest;
import com.aiexam.learning.attempt.infrastructure.AttemptRepository;
import com.aiexam.learning.common.api.PageResponse;
import com.aiexam.learning.common.exception.BusinessRuleException;
import com.aiexam.learning.common.exception.ResourceNotFoundException;
import com.aiexam.learning.elo.domain.EloEvent;
import com.aiexam.learning.elo.domain.EloService;
import com.aiexam.learning.paper.domain.Paper;
import com.aiexam.learning.paper.domain.PaperQuestion;
import com.aiexam.learning.paper.domain.PaperSection;
import com.aiexam.learning.paper.domain.PaperService;
import com.aiexam.learning.question.domain.ContentStatus;
import com.aiexam.learning.question.domain.Question;
import com.aiexam.learning.question.domain.QuestionChoice;
import com.aiexam.learning.user.domain.User;
import com.aiexam.learning.user.infrastructure.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AttemptService {

    private final AttemptRepository attemptRepository;
    private final PaperService paperService;
    private final UserRepository userRepository;
    private final EloService eloService;
    private final ExamAiClient examAiClient;

    @Transactional
    public AttemptResponse start(UUID userId, UUID paperId) {
        User user = user(userId);
        Paper paper = paperService.getPaper(paperId);
        if (paper.getStatus() != ContentStatus.PUBLISHED) {
            throw new BusinessRuleException("PAPER_NOT_PUBLISHED", "Paper is not published");
        }
        return attemptRepository.findByUserIdAndPaperIdAndStatus(userId, paperId, AttemptStatus.IN_PROGRESS)
                .map(AttemptResponse::from)
                .orElseGet(() -> AttemptResponse.from(attemptRepository.save(Attempt.start(user, paper))));
    }

    @Transactional
    public AttemptResponse submit(UUID userId, UUID attemptId, AttemptSubmitRequest request) {
        Attempt attempt = getOwned(userId, attemptId);
        if (attempt.getStatus() != AttemptStatus.IN_PROGRESS) {
            throw new BusinessRuleException("ATTEMPT_NOT_EDITABLE", "Attempt is not in progress");
        }
        Map<UUID, PaperQuestion> items = attempt.getPaper().getItems().stream()
                .collect(Collectors.toMap(item -> item.getQuestion().getId(), Function.identity()));
        List<UUID> missing = AttemptCompleteness.unanswered(items.keySet(), request.answers());
        if (!missing.isEmpty()) {
            throw new BusinessRuleException("INCOMPLETE_ATTEMPT", "Answer every question before submitting");
        }
        for (AnswerSubmitRequest submitted : request.answers()) {
            PaperQuestion item = items.get(submitted.questionId());
            if (item == null) {
                throw new BusinessRuleException("QUESTION_NOT_ON_PAPER", "Question is not on this paper");
            }
            Question question = item.getQuestion();
            QuestionChoice selected = resolveChoice(question, submitted.selectedChoiceId());
            AttemptAnswer answer = attempt.addAnswer(question, selected, submitted.textAnswer());
            grade(answer, question, selected, submitted.textAnswer(), item.getPoints());
        }
        applyPartTwoGroupScores(attempt, items);
        attempt.markSubmitted();
        BigDecimal total = attempt.getAnswers().stream()
                .map(AttemptAnswer::getScore)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal max = attempt.getMaxScore() == null || attempt.getMaxScore().signum() == 0
                ? Ts10Scoring.MAX_SCORE
                : attempt.getMaxScore();
        EloEvent event;
        if (attempt.getPaper().getPaperSet() != null) {
            event = eloService.applyScoreDelta(attempt.getUser(), attempt, Ts10Scoring.eloDelta(total));
        } else {
            double ratio = Ts10Scoring.eloScore(total, max);
            int paperElo = (int) Math.round(attempt.getPaper().getItems().stream()
                    .mapToInt(item -> item.getQuestion().getEloRating())
                    .average()
                    .orElse(attempt.getUser().getEloRating()));
            event = eloService.applyAttemptResult(attempt.getUser(), attempt, paperElo, ratio);
        }
        attempt.markGraded(total, event.getRatingBefore(), event.getRatingAfter());
        return AttemptResponse.from(attempt);
    }

    public AttemptResponse get(UUID userId, UUID attemptId) {
        return AttemptResponse.from(getOwned(userId, attemptId));
    }

    public AttemptSolutionResponse solutions(UUID userId, UUID attemptId) {
        Attempt attempt = getOwned(userId, attemptId);
        if (attempt.getStatus() != AttemptStatus.GRADED) {
            throw new BusinessRuleException("ATTEMPT_NOT_GRADED", "Solutions are available after the exam is graded");
        }
        return new AttemptSolutionResponse(
                AttemptResponse.from(attempt),
                paperService.get(attempt.getPaper().getId(), true)
        );
    }

    public PageResponse<AttemptResponse> listMine(UUID userId, Pageable pageable) {
        return PageResponse.from(attemptRepository.findByUserId(userId, pageable).map(AttemptResponse::from));
    }

    public Attempt getAttempt(UUID attemptId) {
        return attemptRepository.findWithAnswersById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("ATTEMPT_NOT_FOUND", "Attempt not found: " + attemptId));
    }

    private void applyPartTwoGroupScores(Attempt attempt, Map<UUID, PaperQuestion> items) {
        Map<String, List<AttemptAnswer>> groups = new LinkedHashMap<>();
        for (AttemptAnswer answer : attempt.getAnswers()) {
            PaperQuestion item = items.get(answer.getQuestion().getId());
            if (item == null || item.getSection() != PaperSection.PART_II || item.getGroupKey() == null) {
                continue;
            }
            groups.computeIfAbsent(item.getGroupKey(), key -> new ArrayList<>()).add(answer);
        }
        for (List<AttemptAnswer> group : groups.values()) {
            List<AttemptAnswer> correct = group.stream()
                    .filter(answer -> Boolean.TRUE.equals(answer.getCorrect()))
                    .toList();
            BigDecimal groupScore = Ts10Scoring.partTwoGroupScore(correct.size());
            for (AttemptAnswer answer : group) {
                if (!Boolean.TRUE.equals(answer.getCorrect())) {
                    answer.grade(false, BigDecimal.ZERO.setScale(2), answer.getAiFeedback(), GradedBy.AUTO);
                }
            }
            if (correct.isEmpty()) {
                continue;
            }
            BigDecimal share = groupScore.divide(BigDecimal.valueOf(correct.size()), 2, RoundingMode.HALF_UP);
            BigDecimal assigned = BigDecimal.ZERO;
            for (int i = 0; i < correct.size(); i++) {
                BigDecimal piece = i == correct.size() - 1 ? groupScore.subtract(assigned) : share;
                AttemptAnswer answer = correct.get(i);
                answer.grade(true, piece, answer.getAiFeedback(), GradedBy.AUTO);
                assigned = assigned.add(piece);
            }
        }
    }

    private void grade(
            AttemptAnswer answer,
            Question question,
            QuestionChoice selected,
            String textAnswer,
            BigDecimal points
    ) {
        if (question.isObjective()) {
            boolean correct = selected != null && selected.isCorrect();
            answer.grade(correct, correct ? points : BigDecimal.ZERO.setScale(2), null, GradedBy.AUTO);
            return;
        }
        ExamAiClient.GradeResult result = examAiClient.grade(question, textAnswer, points);
        answer.grade(result.correct(), result.score(), result.feedback(), GradedBy.AI);
    }

    private QuestionChoice resolveChoice(Question question, UUID selectedChoiceId) {
        if (selectedChoiceId == null) {
            return null;
        }
        return question.getChoices().stream()
                .filter(choice -> choice.getId().equals(selectedChoiceId))
                .findFirst()
                .orElseThrow(() -> new BusinessRuleException("INVALID_CHOICE", "Choice does not belong to the question"));
    }

    private Attempt getOwned(UUID userId, UUID attemptId) {
        Attempt attempt = getAttempt(attemptId);
        if (!attempt.getUser().getId().equals(userId)) {
            throw new BusinessRuleException("ATTEMPT_FORBIDDEN", "Attempt does not belong to the current user");
        }
        return attempt;
    }

    private User user(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("USER_NOT_FOUND", "User not found: " + userId));
    }
}
