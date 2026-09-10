package com.aiexam.learning.attempt.api;

import com.aiexam.learning.attempt.domain.AttemptService;
import com.aiexam.learning.auth.domain.CurrentUser;
import com.aiexam.learning.common.api.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/attempts")
@RequiredArgsConstructor
public class AttemptController {

    private final AttemptService attemptService;

    @GetMapping
    public PageResponse<AttemptResponse> listMine(Pageable pageable) {
        return attemptService.listMine(CurrentUser.id(), pageable);
    }

    @GetMapping("/{id}")
    public AttemptResponse get(@PathVariable UUID id) {
        return attemptService.get(CurrentUser.id(), id);
    }

    @PostMapping("/{id}/submit")
    public AttemptResponse submit(@PathVariable UUID id, @Valid @RequestBody AttemptSubmitRequest request) {
        return attemptService.submit(CurrentUser.id(), id, request);
    }
}
