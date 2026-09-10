package com.aiexam.learning.catalog.infrastructure;

import com.aiexam.learning.catalog.domain.Topic;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface TopicRepository extends JpaRepository<Topic, UUID> {

    Page<Topic> findBySubjectId(UUID subjectId, Pageable pageable);

    boolean existsBySubjectIdAndNameIgnoreCase(UUID subjectId, String name);
}
