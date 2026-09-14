package com.aiexam.learning.question.infrastructure;

import com.aiexam.learning.question.domain.ContentStatus;
import com.aiexam.learning.question.domain.Question;
import com.aiexam.learning.question.domain.QuestionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface QuestionRepository extends JpaRepository<Question, UUID> {

    @EntityGraph(attributePaths = {"choices", "subject", "topic"})
    Optional<Question> findWithChoicesById(UUID id);

    @EntityGraph(attributePaths = {"choices", "subject", "topic"})
    Page<Question> findBySubjectIdAndStatus(UUID subjectId, ContentStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"choices", "subject", "topic"})
    Page<Question> findByStatus(ContentStatus status, Pageable pageable);

    @Query("""
            SELECT q FROM Question q
            WHERE q.subject.id = :subjectId
              AND q.status = :status
              AND q.eloRating BETWEEN :minElo AND :maxElo
            ORDER BY q.eloRating ASC, q.id ASC
            """)
    List<Question> findPublishedInEloRange(
            @Param("subjectId") UUID subjectId,
            @Param("status") ContentStatus status,
            @Param("minElo") int minElo,
            @Param("maxElo") int maxElo
    );

    @Query("""
            SELECT q FROM Question q
            WHERE q.subject.id = :subjectId
              AND q.status = :status
              AND q.type = :type
              AND q.eloRating BETWEEN :minElo AND :maxElo
            ORDER BY q.eloRating ASC, q.id ASC
            """)
    List<Question> findPublishedInEloRangeAndType(
            @Param("subjectId") UUID subjectId,
            @Param("status") ContentStatus status,
            @Param("type") QuestionType type,
            @Param("minElo") int minElo,
            @Param("maxElo") int maxElo
    );

    boolean existsByIdAndStatus(UUID id, ContentStatus status);
}
