package com.aiexam.learning.paper.api;

import com.aiexam.learning.paper.domain.PaperSetService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/paper-sets")
@RequiredArgsConstructor
public class PaperSetController {

    private final PaperSetService paperSetService;

    @GetMapping
    public List<PaperSetResponse> list() {
        return paperSetService.listPublished();
    }

    @GetMapping("/{id}")
    public PaperSetResponse get(@PathVariable UUID id) {
        return paperSetService.get(id);
    }
}
