package com.aiexam.learning.attempt.domain;

import com.aiexam.learning.ai.domain.ExamAiClient;
import com.aiexam.learning.attempt.api.AnswerSubmitRequest;
import com.aiexam.learning.attempt.api.AttemptResponse;
import com.aiexam.learning.attempt.api.AttemptSubmitRequest;
import com.aiexam.learning.attempt.infrastructure.AttemptRepository;
import com.aiexam.learning.common.api.PageResponse;
import com.aiexam.learning.common.exception.BusinessRuleException;
import com.aiexam.learning.common.exception.ResourceNotFoundException;
import com.aiexam.learning.elo.domain.EloEvent;
import com.aiexam.learning.elo.domain.EloService;
import com.aiexam.learning.paper.domain.Paper;
import com.aiexam.learning.paper.domain.PaperQuestion;
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
        if (attemptRepository.existsByUserIdAndPaperIdAndStatus(userId, paperId, AttemptStatus.IN_PROGRESS)) {
            throw new BusinessRuleException("ATTEMPT_IN_PROGRESS", "An attempt is already in progress for this paper");
        }
        Attempt attempt = Attempt.start(user, paper);
        return AttemptResponse.from(attemptRepository.save(attempt));
    }

    @Transactional
    public AttemptResponse submit(UUID userId, UUID attemptId, AttemptSubmitRequest request) {
        Attempt attempt = getOwned(userId, attemptId);
        if (attempt.getStatus() != AttemptStatus.IN_PROGRESS) {
            throw new BusinessRuleException("ATTEMPT_NOT_EDITABLE", "Attempt is not in progress");
        }
        Map<UUID, PaperQuestion> items = attempt.getPaper().getItems().stream()
                .collect(Collectors.toMap(item -> item.getQuestion().getId(), Function.identity()));
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
        attempt.markSubmitted();
        BigDecimal total = attempt.getAnswers().stream()
                .map(AttemptAnswer::getScore)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal max = attempt.getMaxScore() == null || attempt.getMaxScore().signum() == 0
                ? BigDecimal.ONE
                : attempt.getMaxScore();
        double ratio = total.divide(max, 4, RoundingMode.HALF_UP).doubleValue();
        int paperElo = (int) Math.round(attempt.getPaper().getItems().stream()
                .mapToInt(item -> item.getQuestion().getEloRating())
                .average()
                .orElse(attempt.getUser().getEloRating()));
        EloEvent event = eloService.applyAttemptResult(attempt.getUser(), attempt, paperElo, ratio);
        attempt.markGraded(total, event.getRatingBefore(), event.getRatingAfter());
        return AttemptResponse.from(attempt);
    }

    public AttemptResponse get(UUID userId, UUID attemptId) {
        return AttemptResponse.from(getOwned(userId, attemptId));
    }

    public PageResponse<AttemptResponse> listMine(UUID userId, Pageable pageable) {
        return PageResponse.from(attemptRepository.findByUserId(userId, pageable).map(AttemptResponse::from));
    }

    public Attempt getAttempt(UUID attemptId) {
        return attemptRepository.findWithAnswersById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("ATTEMPT_NOT_FOUND", "Attempt not found: " + attemptId));
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
