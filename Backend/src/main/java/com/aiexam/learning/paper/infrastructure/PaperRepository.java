package com.aiexam.learning.paper.infrastructure;

import com.aiexam.learning.paper.domain.Paper;
import com.aiexam.learning.paper.domain.PaperKind;
import com.aiexam.learning.question.domain.ContentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    @EntityGraph(attributePaths = {"subject", "items", "items.question"})
    List<Paper> findByAuthor_IdAndPaperSetIsNull(UUID authorId);

    List<Paper> findByPaperSet_Id(UUID paperSetId);

    @Query("""
            select p from Paper p
            where p.status = :status
              and (
                not exists (select cp.id from ClassroomPaper cp where cp.paper = p)
                or exists (
                  select cp.id from ClassroomPaper cp
                  where cp.paper = p and cp.classroom.teacher.id = :teacherId
                )
              )
            """)
    Page<Paper> findVisibleToTeacherByStatus(
            @Param("teacherId") UUID teacherId,
            @Param("status") ContentStatus status,
            Pageable pageable);

    @Query("""
            select p from Paper p
            where p.kind = :kind
              and p.status = :status
              and (
                not exists (select cp.id from ClassroomPaper cp where cp.paper = p)
                or exists (
                  select cp.id from ClassroomPaper cp
                  where cp.paper = p and cp.classroom.teacher.id = :teacherId
                )
              )
            """)
    Page<Paper> findVisibleToTeacherByKindAndStatus(
            @Param("teacherId") UUID teacherId,
            @Param("kind") PaperKind kind,
            @Param("status") ContentStatus status,
            Pageable pageable);

    @Query("""
            select p from Paper p
            where p.subject.id = :subjectId
              and p.status = :status
              and (
                not exists (select cp.id from ClassroomPaper cp where cp.paper = p)
                or exists (
                  select cp.id from ClassroomPaper cp
                  where cp.paper = p and cp.classroom.teacher.id = :teacherId
                )
              )
            """)
    Page<Paper> findVisibleToTeacherBySubjectIdAndStatus(
            @Param("teacherId") UUID teacherId,
            @Param("subjectId") UUID subjectId,
            @Param("status") ContentStatus status,
            Pageable pageable);

    @Query("""
            select p from Paper p
            where p.status = :status
              and exists (
                select cp.id from ClassroomPaper cp
                where cp.paper = p
                  and exists (
                    select m.id from ClassroomMember m
                    where m.classroom = cp.classroom and m.student.id = :studentId
                  )
              )
            """)
    Page<Paper> findSharedWithStudentByStatus(
            @Param("studentId") UUID studentId,
            @Param("status") ContentStatus status,
            Pageable pageable);

    @Query("""
            select p from Paper p
            where p.kind = :kind
              and p.status = :status
              and exists (
                select cp.id from ClassroomPaper cp
                where cp.paper = p
                  and exists (
                    select m.id from ClassroomMember m
                    where m.classroom = cp.classroom and m.student.id = :studentId
                  )
              )
            """)
    Page<Paper> findSharedWithStudentByKindAndStatus(
            @Param("studentId") UUID studentId,
            @Param("kind") PaperKind kind,
            @Param("status") ContentStatus status,
            Pageable pageable);

    @Query("""
            select p from Paper p
            where p.subject.id = :subjectId
              and p.status = :status
              and exists (
                select cp.id from ClassroomPaper cp
                where cp.paper = p
                  and exists (
                    select m.id from ClassroomMember m
                    where m.classroom = cp.classroom and m.student.id = :studentId
                  )
              )
            """)
    Page<Paper> findSharedWithStudentBySubjectIdAndStatus(
            @Param("studentId") UUID studentId,
            @Param("subjectId") UUID subjectId,
            @Param("status") ContentStatus status,
            Pageable pageable);

    @EntityGraph(attributePaths = {"items", "items.question"})
    List<Paper> findByPaperSetIdOrderByExamNumberAsc(UUID paperSetId);

    long countByPaperSetId(UUID paperSetId);
}
