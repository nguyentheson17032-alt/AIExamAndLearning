package com.aiexam.learning.promotion.domain;

import com.aiexam.learning.attempt.api.AttemptResponse;
import com.aiexam.learning.attempt.domain.Attempt;
import com.aiexam.learning.attempt.domain.AttemptStatus;
import com.aiexam.learning.attempt.infrastructure.AttemptRepository;
import com.aiexam.learning.catalog.domain.Subject;
import com.aiexam.learning.catalog.infrastructure.SubjectRepository;
import com.aiexam.learning.common.exception.BusinessRuleException;
import com.aiexam.learning.common.exception.ResourceNotFoundException;
import com.aiexam.learning.paper.domain.Paper;
import com.aiexam.learning.paper.domain.PaperKind;
import com.aiexam.learning.paper.domain.PaperService;
import com.aiexam.learning.promotion.api.PromotionStatusResponse;
import com.aiexam.learning.user.domain.RankCode;
import com.aiexam.learning.user.domain.User;
import com.aiexam.learning.user.infrastructure.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PromotionService {

    private final UserRepository userRepository;
    private final AttemptRepository attemptRepository;
    private final PaperService paperService;
    private final SubjectRepository subjectRepository;

    public PromotionStatusResponse getStatus(UUID userId) {
        User user = getUser(userId);
        RankCode currentRank = user.getRankCode();
        RankCode.PromotionRequirement req = currentRank.promotionRequirement();

        if (req == null) {
            return PromotionStatusResponse.maxRank(currentRank, user.getEloRating());
        }

        int currentWins = countRecentPassedPromotionAttempts(userId, req.targetRank(), req.minEloThreshold());
        boolean eligible = user.getEloRating() >= req.minEloThreshold();
        String description = "Cần " + req.requiredWins() + " bài thi đạt >= " + Math.round(req.minPassingRatio() * 100) +
                "% số câu đúng để thăng hạng " + req.targetRank();

        return new PromotionStatusResponse(
                currentRank,
                req.targetRank(),
                user.getEloRating(),
                req.minEloThreshold(),
                eligible,
                req.difficulty(),
                req.questionCount(),
                req.durationMinutes(),
                req.minPassingRatio(),
                req.requiredWins(),
                Math.min(req.requiredWins(), currentWins),
                false,
                description
        );
    }

    @Transactional
    public AttemptResponse startPromotionExam(UUID userId, UUID subjectId) {
        User user = getUser(userId);
        RankCode currentRank = user.getRankCode();
        RankCode.PromotionRequirement req = currentRank.promotionRequirement();

        if (req == null) {
            throw new BusinessRuleException("MAX_RANK_REACHED", "Bạn đã đạt bậc xếp hạng cao nhất (DIAMOND)!");
        }

        if (user.getEloRating() < req.minEloThreshold()) {
            throw new BusinessRuleException(
                    "PROMOTION_NOT_ELIGIBLE",
                    "Bạn cần đạt tối thiểu " + req.minEloThreshold() + " Elo để tham gia bài thi thăng hạng " + req.targetRank()
            );
        }

        Subject subject = subjectId != null
                ? subjectRepository.findById(subjectId).orElseThrow(() -> new ResourceNotFoundException("SUBJECT_NOT_FOUND", "Subject not found: " + subjectId))
                : subjectRepository.findFirstByOrderByNameAsc().orElseThrow(() -> new ResourceNotFoundException("NO_SUBJECT", "No subject found"));

        int currentWins = countRecentPassedPromotionAttempts(userId, req.targetRank(), req.minEloThreshold());
        int examIndex = Math.min(req.requiredWins(), currentWins + 1);

        String title = "Thử thách thăng hạng " + req.targetRank() + " (Bài " + examIndex + "/" + req.requiredWins() + ")";
        String desc = "Đạt >= " + Math.round(req.minPassingRatio() * 100) + "% số câu đúng (" + req.questionCount() + " câu) để tích lũy 1 lượt thắng thăng hạng " + req.targetRank();

        int preferredMin = Math.max(100, req.minEloThreshold() - 150);
        int preferredMax = req.minEloThreshold() + 150;

        Paper paper = paperService.generatePromotionPaper(
                user,
                subject,
                title,
                desc,
                req.questionCount(),
                req.durationMinutes(),
                preferredMin,
                preferredMax
        );

        Attempt attempt = attemptRepository.save(Attempt.start(user, paper));
        return AttemptResponse.from(attempt);
    }

    @Transactional
    public void checkAndApplyPromotion(User user, Attempt attempt, double scoreRatio) {
        if (attempt.getPaper() == null || attempt.getPaper().getKind() != PaperKind.PROMOTION) {
            return;
        }

        RankCode currentRank = user.getRankCode();
        RankCode.PromotionRequirement req = currentRank.promotionRequirement();
        if (req == null) {
            return;
        }

        if (scoreRatio >= req.minPassingRatio()) {
            int previousWins = countRecentPassedPromotionAttempts(user.getId(), req.targetRank(), req.minEloThreshold());
            // including this graded attempt, check if wins reach requiredWins
            if (previousWins >= req.requiredWins()) {
                user.promoteTo(req.targetRank());
            }
        }
    }

    public int countRecentPassedPromotionAttempts(UUID userId, RankCode targetRank, int minEloThreshold) {
        List<Attempt> gradedAttempts = attemptRepository.findByUserId(userId, org.springframework.data.domain.Pageable.unpaged()).getContent();
        int passCount = 0;
        for (Attempt a : gradedAttempts) {
            if (a.getStatus() == AttemptStatus.GRADED
                    && a.getPaper() != null
                    && a.getPaper().getKind() == PaperKind.PROMOTION
                    && a.getPaper().getTargetEloMin() >= minEloThreshold - 300
                    && a.getScore() != null
                    && a.getMaxScore() != null
                    && a.getMaxScore().signum() > 0) {
                double ratio = a.getScore().doubleValue() / a.getMaxScore().doubleValue();
                if (ratio >= 0.80) {
                    passCount++;
                }
            }
        }
        return passCount;
    }

    private User getUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("USER_NOT_FOUND", "User not found: " + userId));
    }
}
