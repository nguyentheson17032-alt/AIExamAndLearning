package com.aiexam.learning.classroom.infrastructure;

import com.aiexam.learning.classroom.domain.ClassroomPaper;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface ClassroomPaperRepository extends JpaRepository<ClassroomPaper, UUID> {

    boolean existsByPaper_Id(UUID paperId);

    boolean existsByClassroom_IdAndPaper_Id(UUID classroomId, UUID paperId);

    int countByClassroom_Id(UUID classroomId);

    void deleteByClassroom_IdAndPaper_Id(UUID classroomId, UUID paperId);


    @Query("select cp.paper.id from ClassroomPaper cp where cp.classroom.id = :classroomId")
    List<UUID> findPaperIdsByClassroomId(@Param("classroomId") UUID classroomId);

    @Query("""
            select cp from ClassroomPaper cp
            join fetch cp.paper
            where cp.classroom.id = :classroomId
            order by cp.createdAt asc
            """)
    List<ClassroomPaper> findByClassroomIdWithPaper(@Param("classroomId") UUID classroomId);

    @Query("""
            select count(cp) from ClassroomPaper cp
            where cp.paper.id = :paperId and cp.classroom.teacher.id = :userId
            """)
    long countTaughtBy(@Param("paperId") UUID paperId, @Param("userId") UUID userId);

    @Query("""
            select count(cp) from ClassroomPaper cp
            where cp.paper.id = :paperId
              and exists (
                  select m.id from ClassroomMember m
                  where m.classroom = cp.classroom and m.student.id = :studentId
              )
            """)
    long countForStudent(@Param("paperId") UUID paperId, @Param("studentId") UUID studentId);
}
