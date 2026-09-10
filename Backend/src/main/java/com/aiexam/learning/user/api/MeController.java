package com.aiexam.learning.user.api;

import com.aiexam.learning.auth.domain.CurrentUser;
import com.aiexam.learning.common.api.PageResponse;
import com.aiexam.learning.elo.api.EloEventResponse;
import com.aiexam.learning.elo.domain.EloService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/me")
@RequiredArgsConstructor
public class MeController {

    private final EloService eloService;

    @GetMapping
    public UserProfileResponse me() {
        return UserProfileResponse.from(CurrentUser.require().getUser());
    }

    @GetMapping("/elo-events")
    public PageResponse<EloEventResponse> eloEvents(Pageable pageable) {
        return eloService.history(CurrentUser.id(), pageable);
    }
}
