package com.aiexam.learning.ai.infrastructure;

import com.aiexam.learning.ai.domain.AiGenerationJob;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AiGenerationJobRepository extends JpaRepository<AiGenerationJob, UUID> {
}
