package com.aiexam.learning.paper.api;

import com.aiexam.learning.attempt.api.AttemptResponse;
import com.aiexam.learning.attempt.domain.AttemptService;
import com.aiexam.learning.auth.domain.CurrentUser;
import com.aiexam.learning.common.api.PageResponse;
import com.aiexam.learning.paper.domain.PaperKind;
import com.aiexam.learning.paper.domain.PaperService;
import com.aiexam.learning.paper.domain.PracticeService;
import com.aiexam.learning.question.domain.ContentStatus;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class PaperController {

    private final PaperService paperService;
    private final PracticeService practiceService;
    private final AttemptService attemptService;

    @PostMapping("/papers")
    public ResponseEntity<PaperResponse> create(@Valid @RequestBody PaperCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(paperService.create(CurrentUser.id(), request));
    }

    @PostMapping("/papers/generate")
    public ResponseEntity<PaperResponse> generate(@Valid @RequestBody PaperGenerateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(paperService.generate(CurrentUser.id(), request));
    }

    @GetMapping("/papers")
    public PageResponse<PaperResponse> list(
            @RequestParam(required = false) UUID subjectId,
            @RequestParam(required = false) PaperKind kind,
            @RequestParam(required = false) ContentStatus status,
            Pageable pageable
    ) {
        return paperService.list(CurrentUser.require().getUser(), subjectId, kind, status, pageable);
    }

    @GetMapping("/papers/{id}")
    public PaperResponse get(@PathVariable UUID id) {
        return paperService.getForReader(CurrentUser.require().getUser(), id, CurrentUser.teacherOrAdmin());
    }

    @PostMapping("/papers/{id}/attempts")
    public ResponseEntity<AttemptResponse> startAttempt(@PathVariable UUID id) {
        return ResponseEntity.status(HttpStatus.CREATED).body(attemptService.start(CurrentUser.id(), id));
    }

    @PostMapping("/practice/sessions")
    public ResponseEntity<AttemptResponse> startPractice(@Valid @RequestBody PracticeStartRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(practiceService.startPractice(CurrentUser.id(), request));
    }
}
