package com.aiexam.learning.paper.domain;

import com.aiexam.learning.common.exception.ResourceNotFoundException;
import com.aiexam.learning.paper.api.PaperSetItemResponse;
import com.aiexam.learning.paper.api.PaperSetResponse;
import com.aiexam.learning.paper.infrastructure.PaperRepository;
import com.aiexam.learning.paper.infrastructure.PaperSetRepository;
import com.aiexam.learning.question.domain.ContentStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PaperSetService {

    private final PaperSetRepository paperSetRepository;
    private final PaperRepository paperRepository;

    public List<PaperSetResponse> listPublished() {
        return paperSetRepository.findByStatusOrderByAcademicYearDescTitleAsc(ContentStatus.PUBLISHED).stream()
                .map(set -> PaperSetResponse.summary(
                        set, (int) paperRepository.countByPaperSetId(set.getId())))
                .toList();
    }

    public PaperSetResponse get(UUID id) {
        PaperSet set = paperSetRepository.findDetailById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PAPER_SET_NOT_FOUND", "Paper set not found: " + id));
        if (set.getStatus() != ContentStatus.PUBLISHED) {
            throw new ResourceNotFoundException("PAPER_SET_NOT_FOUND", "Paper set not found: " + id);
        }
        List<PaperSetItemResponse> papers = paperRepository.findByPaperSetIdOrderByExamNumberAsc(id).stream()
                .filter(paper -> paper.getStatus() == ContentStatus.PUBLISHED)
                .map(paper -> new PaperSetItemResponse(
                        paper.getId(),
                        paper.getExamNumber(),
                        paper.getTitle(),
                        paper.getDurationMinutes(),
                        paper.getItems().size()
                ))
                .toList();
        return PaperSetResponse.detail(set, papers);
    }

    public PaperSet getSet(UUID id) {
        return paperSetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PAPER_SET_NOT_FOUND", "Paper set not found: " + id));
    }
}
