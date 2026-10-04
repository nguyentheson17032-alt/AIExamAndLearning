package com.aiexam.learning.promotion.api;

import com.aiexam.learning.attempt.api.AttemptResponse;
import com.aiexam.learning.auth.domain.CurrentUser;
import com.aiexam.learning.promotion.domain.PromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/me/promotion")
@RequiredArgsConstructor
public class PromotionController {

    private final PromotionService promotionService;

    @GetMapping
    public PromotionStatusResponse status() {
        return promotionService.getStatus(CurrentUser.id());
    }

    @PostMapping("/start")
    public AttemptResponse start(@RequestBody(required = false) PromotionStartRequest request) {
        return promotionService.startPromotionExam(CurrentUser.id(), request == null ? null : request.subjectId());
    }
}
