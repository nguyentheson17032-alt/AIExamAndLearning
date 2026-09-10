package com.aiexam.learning.question.infrastructure;

import com.aiexam.learning.question.domain.QuestionClassification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface QuestionClassificationRepository extends JpaRepository<QuestionClassification, UUID> {

    List<QuestionClassification> findByQuestionIdOrderByClassifiedAtDesc(UUID questionId);
}
