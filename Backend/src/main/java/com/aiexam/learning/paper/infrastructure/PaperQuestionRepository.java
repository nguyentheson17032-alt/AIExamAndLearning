package com.aiexam.learning.paper.infrastructure;

import com.aiexam.learning.paper.domain.PaperQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PaperQuestionRepository extends JpaRepository<PaperQuestion, UUID> {

    boolean existsByQuestionId(UUID questionId);
}
