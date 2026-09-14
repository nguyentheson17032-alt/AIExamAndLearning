package com.aiexam.learning.question.api;

import com.aiexam.learning.question.domain.QuestionImage;
import com.aiexam.learning.question.domain.QuestionImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/v1/question-images")
@RequiredArgsConstructor
public class QuestionImageController {

    private final QuestionImageService questionImageService;

    @GetMapping("/{id}")
    public ResponseEntity<byte[]> get(@PathVariable UUID id) {
        QuestionImage image = questionImageService.get(id);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(image.getContentType()))
                .cacheControl(CacheControl.maxAge(1, TimeUnit.DAYS).cachePrivate())
                .body(image.getBytes());
    }
}
