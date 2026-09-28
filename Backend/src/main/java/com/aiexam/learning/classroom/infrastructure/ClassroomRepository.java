package com.aiexam.learning.classroom.infrastructure;

import com.aiexam.learning.classroom.domain.Classroom;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ClassroomRepository extends JpaRepository<Classroom, UUID> {

    @Override
    @EntityGraph(attributePaths = "teacher")
    Optional<Classroom> findById(UUID id);

    @EntityGraph(attributePaths = "teacher")
    List<Classroom> findByTeacher_IdOrderByCreatedAtDesc(UUID teacherId);
}
