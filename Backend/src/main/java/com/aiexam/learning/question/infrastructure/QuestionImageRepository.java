package com.aiexam.learning.question.infrastructure;

import com.aiexam.learning.question.domain.QuestionImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface QuestionImageRepository extends JpaRepository<QuestionImage, UUID> {

    Optional<QuestionImage> findByFilename(String filename);
}
