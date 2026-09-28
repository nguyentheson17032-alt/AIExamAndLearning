package com.aiexam.learning.classroom.api;

import java.util.List;
import java.util.UUID;

public record SharePapersRequest(UUID paperId, List<UUID> paperIds, List<UUID> paperSetIds) {}
