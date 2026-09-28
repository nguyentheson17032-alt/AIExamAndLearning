package com.aiexam.learning.classroom.api;

import java.util.List;

public record ShareOptionsResponse(List<ClassPaperResponse> papers, List<SharePaperSetOption> paperSets) {}
