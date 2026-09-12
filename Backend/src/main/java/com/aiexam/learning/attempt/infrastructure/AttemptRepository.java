package com.aiexam.learning.attempt.infrastructure;

import com.aiexam.learning.attempt.domain.Attempt;
import com.aiexam.learning.attempt.domain.AttemptStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AttemptRepository extends JpaRepository<Attempt, UUID> {

    @EntityGraph(attributePaths = {
            "answers",
            "answers.question",
            "paper",
            "user"
    })
    Optional<Attempt> findWithAnswersById(UUID id);

    Page<Attempt> findByUserId(UUID userId, Pageable pageable);

    @EntityGraph(attributePaths = {"answers", "paper", "user"})
    Optional<Attempt> findByUserIdAndPaperIdAndStatus(UUID userId, UUID paperId, AttemptStatus status);
}
