package com.aiexam.learning.question.domain;

import com.aiexam.learning.common.exception.ResourceNotFoundException;
import com.aiexam.learning.question.infrastructure.QuestionImageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class QuestionImageService {

    private final QuestionImageRepository questionImageRepository;

    @Transactional(readOnly = true)
    public QuestionImage get(UUID id) {
        return questionImageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("QUESTION_IMAGE_NOT_FOUND", "Image not found: " + id));
    }
}
