package com.aiexam.learning.paper.domain;

import com.aiexam.learning.catalog.domain.CatalogService;
import com.aiexam.learning.catalog.domain.Subject;
import com.aiexam.learning.common.api.PageResponse;
import com.aiexam.learning.common.exception.BusinessRuleException;
import com.aiexam.learning.common.exception.ResourceNotFoundException;
import com.aiexam.learning.paper.api.PaperCreateRequest;
import com.aiexam.learning.paper.api.PaperGenerateRequest;
import com.aiexam.learning.paper.api.PaperQuestionRequest;
import com.aiexam.learning.paper.api.PaperResponse;
import com.aiexam.learning.paper.infrastructure.PaperRepository;
import com.aiexam.learning.question.domain.ContentStatus;
import com.aiexam.learning.question.domain.Question;
import com.aiexam.learning.question.domain.QuestionService;
import com.aiexam.learning.question.infrastructure.QuestionRepository;
import com.aiexam.learning.user.domain.User;
import com.aiexam.learning.user.infrastructure.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PaperService {

    private final PaperRepository paperRepository;
    private final QuestionRepository questionRepository;
    private final QuestionService questionService;
    private final CatalogService catalogService;
    private final UserRepository userRepository;

    @Transactional
    public PaperResponse create(UUID authorId, PaperCreateRequest request) {
        if (request.targetEloMin() > request.targetEloMax()) {
            throw new BusinessRuleException("INVALID_ELO_RANGE", "targetEloMin must be <= targetEloMax");
        }
        User author = user(authorId);
        Subject subject = catalogService.getSubject(request.subjectId());
        PaperSource source = request.source() == null ? PaperSource.MANUAL : request.source();
        ContentStatus status = request.status() == null ? ContentStatus.PUBLISHED : request.status();
        Paper paper = Paper.create(
                author,
                subject,
                request.title(),
                request.description(),
                request.kind(),
                source,
                request.durationMinutes(),
                request.targetEloMin(),
                request.targetEloMax(),
                status
        );
        addQuestions(paper, request.questions());
        return PaperResponse.from(paperRepository.save(paper), true);
    }

    @Transactional
    public PaperResponse generate(UUID authorId, PaperGenerateRequest request) {
        int min = request.targetEloMin() == null ? 800 : request.targetEloMin();
        int max = request.targetEloMax() == null ? 1600 : request.targetEloMax();
        List<Question> pool = questionRepository.findPublishedInEloRange(
                request.subjectId(), ContentStatus.PUBLISHED, min, max);
        if (pool.size() < request.questionCount()) {
            throw new BusinessRuleException(
                    "NOT_ENOUGH_QUESTIONS",
                    "Not enough published questions in Elo range " + min + "-" + max
            );
        }
        Collections.shuffle(pool);
        List<Question> selected = pool.subList(0, request.questionCount());
        String title = request.title() == null || request.title().isBlank()
                ? "Đề " + request.kind().name().toLowerCase() + " tự động"
                : request.title();
        PaperCreateRequest createRequest = new PaperCreateRequest(
                request.subjectId(),
                title,
                "Generated from the question bank to match Elo " + min + "-" + max,
                request.kind(),
                PaperSource.MANUAL,
                request.durationMinutes(),
                min,
                max,
                ContentStatus.PUBLISHED,
                selected.stream()
                        .map(question -> new PaperQuestionRequest(question.getId(), BigDecimal.ONE))
                        .toList()
        );
        return create(authorId, createRequest);
    }

    public PaperResponse get(UUID id, boolean includeAnswer) {
        return PaperResponse.from(getPaper(id), includeAnswer);
    }

    public Paper getPaper(UUID id) {
        return paperRepository.findWithItemsById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PAPER_NOT_FOUND", "Paper not found: " + id));
    }

    public PageResponse<PaperResponse> list(UUID subjectId, PaperKind kind, ContentStatus status, Pageable pageable) {
        ContentStatus filter = status == null ? ContentStatus.PUBLISHED : status;
        var page = kind != null
                ? paperRepository.findByKindAndStatus(kind, filter, pageable)
                : subjectId != null
                ? paperRepository.findBySubjectIdAndStatus(subjectId, filter, pageable)
                : paperRepository.findByStatus(filter, pageable);
        return PageResponse.from(page.map(paper -> PaperResponse.from(paper, false)));
    }

    private void addQuestions(Paper paper, List<PaperQuestionRequest> requests) {
        LinkedHashSet<UUID> seen = new LinkedHashSet<>();
        int order = 1;
        for (PaperQuestionRequest item : requests) {
            if (!seen.add(item.questionId())) {
                throw new BusinessRuleException("DUPLICATE_QUESTION", "Duplicate question on paper: " + item.questionId());
            }
            Question question = questionService.getQuestion(item.questionId());
            if (!question.getSubject().getId().equals(paper.getSubject().getId())) {
                throw new BusinessRuleException("QUESTION_SUBJECT_MISMATCH", "Question subject does not match paper");
            }
            if (question.getStatus() != ContentStatus.PUBLISHED) {
                throw new BusinessRuleException("QUESTION_NOT_PUBLISHED", "Question is not published: " + question.getId());
            }
            paper.addQuestion(question, order++, item.points());
        }
    }

    private User user(UUID authorId) {
        return userRepository.findById(authorId)
                .orElseThrow(() -> new ResourceNotFoundException("USER_NOT_FOUND", "User not found: " + authorId));
    }
}
