package com.aiexam.learning.attempt.infrastructure;

import com.aiexam.learning.attempt.domain.AttemptAnswer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AttemptAnswerRepository extends JpaRepository<AttemptAnswer, UUID> {
}
