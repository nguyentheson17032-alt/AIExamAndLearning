package com.aiexam.learning.elo.domain;

import com.aiexam.learning.attempt.domain.Attempt;
import com.aiexam.learning.attempt.domain.AttemptAnswer;
import com.aiexam.learning.attempt.domain.AttemptStatus;
import com.aiexam.learning.attempt.infrastructure.AttemptRepository;
import com.aiexam.learning.common.api.PageResponse;
import com.aiexam.learning.common.config.EloProperties;
import com.aiexam.learning.elo.api.EloEventResponse;
import com.aiexam.learning.elo.infrastructure.EloEventRepository;
import com.aiexam.learning.paper.domain.PaperQuestion;
import com.aiexam.learning.question.domain.Question;
import com.aiexam.learning.user.domain.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EloService {

    private final EloEventRepository eloEventRepository;
    private final AttemptRepository attemptRepository;
    private final EloProperties eloProperties;

    @Transactional
    public EloEvent applyAttemptResult(User user, Attempt attempt, int paperElo, BigDecimal totalScore, BigDecimal maxScore, Map<UUID, PaperQuestion> itemMap) {
        int before = user.getEloRating();

        // 1. Thu thập dữ liệu lịch sử của user (độ tích cực và chuỗi phong độ)
        long previousAttemptsCount = attemptRepository.countByUser_IdAndStatus(user.getId(), AttemptStatus.GRADED);
        List<Attempt> recentGraded = attemptRepository.findTop5ByUser_IdAndStatusOrderByGradedAtDesc(user.getId(), AttemptStatus.GRADED);
        int recentStreaks = 0;
        for (Attempt a : recentGraded) {
            if (a.getScore() != null && a.getMaxScore() != null && a.getMaxScore().signum() > 0) {
                double r = a.getScore().doubleValue() / a.getMaxScore().doubleValue();
                if (r >= 0.80) {
                    recentStreaks++;
                } else {
                    break;
                }
            } else {
                break;
            }
        }

        // 2. Tính thời gian làm bài thực tế
        Instant startedAt = attempt.getStartedAt() != null ? attempt.getStartedAt() : Instant.now();
        Instant submittedAt = attempt.getSubmittedAt() != null ? attempt.getSubmittedAt() : Instant.now();
        long timeSpentSeconds = Math.max(1, Duration.between(startedAt, submittedAt).getSeconds());
        int paperDurationMinutes = attempt.getPaper() != null ? attempt.getPaper().getDurationMinutes() : 0;

        // 3. Chuẩn bị danh sách item chi tiết (Per-Item Elo)
        List<EloCalculator.ItemInput> items = new ArrayList<>();
        if (attempt.getAnswers() != null) {
            for (AttemptAnswer ans : attempt.getAnswers()) {
                Question q = ans.getQuestion();
                if (q == null) {
                    continue;
                }
                PaperQuestion pq = itemMap != null ? itemMap.get(q.getId()) : null;
                BigDecimal itemMaxPoints = pq != null ? pq.getPoints() : BigDecimal.ONE;
                BigDecimal itemEarned = ans.getScore() != null ? ans.getScore() : BigDecimal.ZERO;
                items.add(new EloCalculator.ItemInput(
                        q.getId(),
                        q.getEloRating(),
                        q.getDifficulty(),
                        itemMaxPoints,
                        itemEarned
                ));
            }
        }

        // 4. Tính toán theo mô hình Elo nâng cao
        EloCalculator.AdvancedCalculationRequest calcReq = new EloCalculator.AdvancedCalculationRequest(
                before,
                paperElo,
                totalScore,
                maxScore,
                items,
                timeSpentSeconds,
                paperDurationMinutes,
                previousAttemptsCount,
                recentStreaks,
                eloProperties.kFactor()
        );
        EloCalculator.AdvancedCalculationResult result = EloCalculator.calculateAdvanced(calcReq);

        // 5. Cập nhật Elo cho User
        user.applyElo(result.eloAfter());

        // 6. Hiệu chỉnh 2 chiều độ khó cho từng câu hỏi
        if (attempt.getAnswers() != null) {
            for (AttemptAnswer ans : attempt.getAnswers()) {
                Question q = ans.getQuestion();
                if (q != null && result.updatedQuestionElos().containsKey(q.getId())) {
                    q.updateEloRating(result.updatedQuestionElos().get(q.getId()));
                }
            }
        }

        // 7. Ghi nhận sự kiện Elo
        EloEvent event = EloEvent.record(user, attempt, null, before, result.eloAfter(), EloReason.ATTEMPT_GRADED);
        return eloEventRepository.save(event);
    }

    @Transactional
    public EloEvent applyAttemptResult(User user, Attempt attempt, int paperElo, double scoreRatio) {
        BigDecimal total = BigDecimal.valueOf(clamp(scoreRatio) * 10.0);
        BigDecimal max = BigDecimal.valueOf(10.0);
        return applyAttemptResult(user, attempt, paperElo, total, max, Map.of());
    }

    @Transactional
    public EloEvent applyAdjustment(User user, Attempt attempt, int suggestedRating, EloReason reason) {
        int before = user.getEloRating();
        user.applyElo(suggestedRating);
        EloEvent event = EloEvent.record(user, attempt, null, before, suggestedRating, reason);
        return eloEventRepository.save(event);
    }

    public PageResponse<EloEventResponse> history(UUID userId, Pageable pageable) {
        return PageResponse.from(
                eloEventRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable).map(EloEventResponse::from)
        );
    }

    private double clamp(double scoreRatio) {
        if (scoreRatio < 0) {
            return 0;
        }
        if (scoreRatio > 1) {
            return 1;
        }
        return scoreRatio;
    }
}
