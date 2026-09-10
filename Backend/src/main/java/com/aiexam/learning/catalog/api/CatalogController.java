package com.aiexam.learning.catalog.api;

import com.aiexam.learning.catalog.domain.CatalogService;
import com.aiexam.learning.common.api.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/subjects")
@RequiredArgsConstructor
public class CatalogController {

    private final CatalogService catalogService;

    @PostMapping
    public ResponseEntity<SubjectResponse> create(@Valid @RequestBody SubjectCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(catalogService.createSubject(request));
    }

    @GetMapping
    public PageResponse<SubjectResponse> list(Pageable pageable) {
        return catalogService.listSubjects(pageable);
    }

    @GetMapping("/{id}")
    public SubjectResponse get(@PathVariable UUID id) {
        return catalogService.getSubjectResponse(id);
    }

    @PostMapping("/{id}/topics")
    public ResponseEntity<TopicResponse> createTopic(
            @PathVariable UUID id,
            @Valid @RequestBody TopicCreateRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(catalogService.createTopic(id, request));
    }

    @GetMapping("/{id}/topics")
    public PageResponse<TopicResponse> listTopics(@PathVariable UUID id, Pageable pageable) {
        return catalogService.listTopics(id, pageable);
    }
}
