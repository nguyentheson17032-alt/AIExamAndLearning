package com.aiexam.learning.classroom.infrastructure;

import com.aiexam.learning.classroom.domain.ClassroomMember;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ClassroomMemberRepository extends JpaRepository<ClassroomMember, UUID> {

    boolean existsByClassroom_IdAndStudent_Id(UUID classroomId, UUID studentId);

    boolean existsByStudent_Id(UUID studentId);

    int countByClassroom_Id(UUID classroomId);

    @EntityGraph(attributePaths = {"classroom", "classroom.teacher"})
    List<ClassroomMember> findByStudent_IdOrderByCreatedAtDesc(UUID studentId);

    @EntityGraph(attributePaths = "student")
    List<ClassroomMember> findByClassroom_IdOrderByCreatedAtAsc(UUID classroomId);

    void deleteByClassroom_IdAndStudent_Id(UUID classroomId, UUID studentId);
}
