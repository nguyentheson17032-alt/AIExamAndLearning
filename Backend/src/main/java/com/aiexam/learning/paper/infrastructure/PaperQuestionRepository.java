package com.aiexam.learning.paper.infrastructure;

import com.aiexam.learning.paper.domain.PaperQuestion;
import com.aiexam.learning.paper.domain.PaperSection;
import com.aiexam.learning.question.domain.ContentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface PaperQuestionRepository extends JpaRepository<PaperQuestion, UUID> {

    boolean existsByQuestionId(UUID questionId);

    void deleteByQuestion_IdIn(Collection<UUID> questionIds);

    @Query("""
            SELECT DISTINCT pq FROM PaperQuestion pq
            JOIN FETCH pq.paper p
            JOIN FETCH pq.question q
            WHERE pq.section = :section
              AND pq.groupKey IS NOT NULL
              AND p.subject.id = :subjectId
              AND q.status = :status
              AND q.eloRating BETWEEN :minElo AND :maxElo
            """)
    List<PaperQuestion> findGroupedSectionItems(
            @Param("subjectId") UUID subjectId,
            @Param("section") PaperSection section,
            @Param("status") ContentStatus status,
            @Param("minElo") int minElo,
            @Param("maxElo") int maxElo
    );
}
