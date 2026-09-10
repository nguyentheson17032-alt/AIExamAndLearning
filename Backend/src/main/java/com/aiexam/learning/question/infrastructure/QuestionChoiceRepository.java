package com.aiexam.learning.question.infrastructure;

import com.aiexam.learning.question.domain.QuestionChoice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface QuestionChoiceRepository extends JpaRepository<QuestionChoice, UUID> {
}
