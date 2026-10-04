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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
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

    @PostMapping("/tutor/chat")
    public Map<String, Object> chatTutor(@RequestBody TutorChatRequest request) {
        String reply = aiExamService.chatTutor(request.query(), request.currentProblem());
        return Map.of("success", true, "reply", reply);
    }

    @PostMapping("/tutor/evaluate")
    public Map<String, Object> evaluateMath(@RequestBody MathEvaluateRequest request) {
        return aiExamService.evaluateMath(request.problem(), request.userAnswer());
    }

    @PostMapping("/tutor/generate")
    public Map<String, Object> generateMathExercises(@RequestBody MathGenerateTutorRequest request) {
        UUID userId = null;
        try {
            userId = CurrentUser.id();
        } catch (Exception ignored) {}
        return aiExamService.generateMathExercises(
                userId,
                request.getCategory(),
                request.getDifficulty(),
                request.getCount() == null ? 3 : request.getCount(),
                request.getElo(),
                request.getSubjectName()
        );
    }

    @GetMapping("/tutor/predict")
    public Map<String, Object> predictModels(@RequestParam(required = false, defaultValue = "2.0") Double x) {
        return aiExamService.predictModels(x);
    }

    @PostMapping("/math/generate-bank")
    public ResponseEntity<List<QuestionResponse>> generateMathToBank(@Valid @RequestBody MathGenerateBankRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(aiExamService.generateMathToBank(CurrentUser.id(), request));
    }
}

