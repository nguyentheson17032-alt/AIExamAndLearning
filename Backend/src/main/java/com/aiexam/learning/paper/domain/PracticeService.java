package com.aiexam.learning.paper.domain;

import com.aiexam.learning.attempt.api.AttemptResponse;
import com.aiexam.learning.attempt.domain.AttemptService;
import com.aiexam.learning.common.exception.BusinessRuleException;
import com.aiexam.learning.paper.api.PaperCreateRequest;
import com.aiexam.learning.paper.api.PaperQuestionRequest;
import com.aiexam.learning.paper.api.PaperResponse;
import com.aiexam.learning.paper.api.PracticeStartRequest;
import com.aiexam.learning.question.domain.ContentStatus;
import com.aiexam.learning.question.domain.Question;
import com.aiexam.learning.question.infrastructure.QuestionRepository;
import com.aiexam.learning.user.domain.User;
import com.aiexam.learning.user.infrastructure.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PracticeService {

    private final QuestionRepository questionRepository;
    private final PaperService paperService;
    private final AttemptService attemptService;
    private final UserRepository userRepository;

    @Transactional
    public AttemptResponse startPractice(UUID userId, PracticeStartRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new com.aiexam.learning.common.exception.ResourceNotFoundException(
                        "USER_NOT_FOUND", "User not found: " + userId));
        int count = request.questionCount() == null ? 10 : request.questionCount();
        int duration = request.durationMinutes() == null ? 30 : request.durationMinutes();
        int min = Math.max(100, user.getEloRating() - 150);
        int max = user.getEloRating() + 120;
        List<Question> pool = questionRepository.findPublishedInEloRange(
                request.subjectId(), ContentStatus.PUBLISHED, min, max);
        if (pool.size() < Math.min(count, 3)) {
            pool = questionRepository.findPublishedInEloRange(
                    request.subjectId(), ContentStatus.PUBLISHED, 100, 3000);
        }
        if (pool.isEmpty()) {
            throw new BusinessRuleException("NO_PRACTICE_QUESTIONS", "No published questions available for practice");
        }
        pool.sort(Comparator.comparingInt(question -> Math.abs(question.getEloRating() - (user.getEloRating() + 40))));
        if (pool.size() > count) {
            pool = pool.subList(0, count);
        }
        Collections.shuffle(pool);
        PaperResponse paper = paperService.create(userId, new PaperCreateRequest(
                request.subjectId(),
                "Luyện tập Elo " + user.getEloRating(),
                "Adaptive practice around rank " + user.getRankCode(),
                PaperKind.PRACTICE,
                PaperSource.MANUAL,
                duration,
                min,
                max,
                ContentStatus.PUBLISHED,
                pool.stream()
                        .map(question -> new PaperQuestionRequest(question.getId(), BigDecimal.ONE))
                        .toList(),
                null
        ));
        return attemptService.start(userId, paper.id());
    }
}
