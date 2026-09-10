package com.aiexam.learning.question.api;

import com.aiexam.learning.auth.domain.CurrentUser;
import com.aiexam.learning.common.api.PageResponse;
import com.aiexam.learning.question.domain.ContentStatus;
import com.aiexam.learning.question.domain.QuestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/questions")
@RequiredArgsConstructor
public class QuestionController {

    private final QuestionService questionService;

    @PostMapping
    public ResponseEntity<QuestionResponse> create(@Valid @RequestBody QuestionCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(questionService.create(CurrentUser.id(), request));
    }

    @PostMapping("/upload")
    public ResponseEntity<List<QuestionResponse>> upload(@Valid @RequestBody QuestionUploadRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(questionService.upload(CurrentUser.id(), request.questions()));
    }

    @PutMapping("/{id}")
    public QuestionResponse update(@PathVariable UUID id, @Valid @RequestBody QuestionUpdateRequest request) {
        return questionService.update(id, request);
    }

    @GetMapping("/{id}")
    public QuestionResponse get(@PathVariable UUID id) {
        return questionService.get(id, CurrentUser.teacherOrAdmin());
    }

    @GetMapping
    public PageResponse<QuestionResponse> list(
            @RequestParam(required = false) UUID subjectId,
            @RequestParam(required = false) ContentStatus status,
            Pageable pageable
    ) {
        return questionService.list(subjectId, status, CurrentUser.teacherOrAdmin(), pageable);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> archive(@PathVariable UUID id) {
        questionService.archive(id);
        return ResponseEntity.noContent().build();
    }
}
