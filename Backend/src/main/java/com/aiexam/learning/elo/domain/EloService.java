package com.aiexam.learning.elo.domain;

import com.aiexam.learning.attempt.domain.Attempt;
import com.aiexam.learning.common.config.EloProperties;
import com.aiexam.learning.common.api.PageResponse;
import com.aiexam.learning.elo.api.EloEventResponse;
import com.aiexam.learning.elo.infrastructure.EloEventRepository;
import com.aiexam.learning.user.domain.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EloService {

    private final EloEventRepository eloEventRepository;
    private final EloProperties eloProperties;

    @Transactional
    public EloEvent applyAttemptResult(User user, Attempt attempt, int paperElo, double scoreRatio) {
        int before = user.getEloRating();
        int after = Math.max(100, EloCalculator.nextRating(before, paperElo, clamp(scoreRatio), eloProperties.kFactor()));
        user.applyElo(after);
        EloEvent event = EloEvent.record(user, attempt, null, before, after, EloReason.ATTEMPT_GRADED);
        return eloEventRepository.save(event);
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
