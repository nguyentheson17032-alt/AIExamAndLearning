package com.aiexam.learning.paper.infrastructure;

import com.aiexam.learning.paper.domain.PaperSet;
import com.aiexam.learning.question.domain.ContentStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PaperSetRepository extends JpaRepository<PaperSet, UUID> {

    @EntityGraph(attributePaths = {"subject", "author"})
    Optional<PaperSet> findDetailById(UUID id);

    List<PaperSet> findByStatusOrderByAcademicYearDescTitleAsc(ContentStatus status);

    @EntityGraph(attributePaths = {"subject", "author"})
    List<PaperSet> findBySubject_IdAndStatusOrderByAcademicYearDescTitleAsc(UUID subjectId, ContentStatus status);

    @EntityGraph(attributePaths = {"subject", "author"})
    List<PaperSet> findByAuthor_IdOrderByTitleAsc(UUID authorId);

    Optional<PaperSet> findByAcademicYearAndTitle(String academicYear, String title);

    boolean existsByAcademicYearAndTitle(String academicYear, String title);
}
