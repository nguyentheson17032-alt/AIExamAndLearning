package com.aiexam.learning.ai.api;

import com.aiexam.learning.ai.domain.AiExamService;
import com.aiexam.learning.auth.domain.CurrentUser;
import com.aiexam.learning.paper.api.PaperResponse;
import com.aiexam.learning.question.api.QuestionResponse;
import com.aiexam.learning.user.api.UserProfileResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiExamService aiExamService;

    @PostMapping("/questions/{id}/classify")
    public QuestionResponse classify(@PathVariable UUID id) {
        return aiExamService.classify(CurrentUser.id(), id);
    }

    @PostMapping("/questions/{id}/similar")
    public ResponseEntity<List<QuestionResponse>> similar(
            @PathVariable UUID id,
            @Valid @RequestBody(required = false) SimilarGenerateRequest request
    ) {
        int count = request == null || request.count() == null ? 3 : request.count();
        return ResponseEntity.status(HttpStatus.CREATED).body(aiExamService.generateSimilar(CurrentUser.id(), id, count));
    }

    @PostMapping("/papers/practice")
    public ResponseEntity<PaperResponse> practicePaper(@Valid @RequestBody PracticeGenerateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(aiExamService.generatePracticePaper(CurrentUser.id(), request));
    }

    @PostMapping("/attempts/{id}/elo")
    public UserProfileResponse adjustElo(@PathVariable UUID id) {
        return aiExamService.adjustElo(CurrentUser.id(), id);
    }

    @GetMapping("/jobs/{id}")
    public AiJobResponse job(@PathVariable UUID id) {
        return aiExamService.getJob(id);
    }
}
