package com.aiexam.learning.attempt.infrastructure;

import com.aiexam.learning.attempt.domain.Attempt;
import com.aiexam.learning.attempt.domain.AttemptStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AttemptRepository extends JpaRepository<Attempt, UUID> {

    @EntityGraph(attributePaths = {
            "answers",
            "answers.question",
            "paper",
            "paper.paperSet",
            "user"
    })
    Optional<Attempt> findWithAnswersById(UUID id);

    Page<Attempt> findByUserId(UUID userId, Pageable pageable);

    @EntityGraph(attributePaths = {"answers", "paper", "paper.paperSet", "user"})
    Optional<Attempt> findByUserIdAndPaperIdAndStatus(UUID userId, UUID paperId, AttemptStatus status);

    boolean existsByUser_IdAndPaper_Id(UUID userId, UUID paperId);

    List<Attempt> findByPaper_IdIn(Collection<UUID> paperIds);

    void deleteByPaper_IdIn(Collection<UUID> paperIds);

    long countByUser_IdAndStatus(UUID userId, AttemptStatus status);

    long countByUser_Id(UUID userId);

    @EntityGraph(attributePaths = {"paper", "paper.subject"})
    List<Attempt> findByUser_IdOrderByStartedAtDesc(UUID userId);

    List<Attempt> findTop5ByUser_IdAndStatusOrderByGradedAtDesc(UUID userId, AttemptStatus status);
}

