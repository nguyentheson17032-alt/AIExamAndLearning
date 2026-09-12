package com.aiexam.learning.paper.infrastructure;

import com.aiexam.learning.paper.domain.Paper;
import com.aiexam.learning.paper.domain.PaperKind;
import com.aiexam.learning.question.domain.ContentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PaperRepository extends JpaRepository<Paper, UUID> {

    @EntityGraph(attributePaths = {
            "author",
            "subject",
            "paperSet",
            "items",
            "items.question",
            "items.question.author",
            "items.question.subject",
            "items.question.topic"
    })
    Optional<Paper> findWithItemsById(UUID id);

    Page<Paper> findBySubjectIdAndStatus(UUID subjectId, ContentStatus status, Pageable pageable);

    Page<Paper> findByKindAndStatus(PaperKind kind, ContentStatus status, Pageable pageable);

    Page<Paper> findByStatus(ContentStatus status, Pageable pageable);

    @EntityGraph(attributePaths = "items")
    List<Paper> findByPaperSetIdOrderByExamNumberAsc(UUID paperSetId);

    long countByPaperSetId(UUID paperSetId);
}
