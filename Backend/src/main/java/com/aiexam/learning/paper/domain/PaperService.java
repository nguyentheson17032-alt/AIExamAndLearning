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
import com.aiexam.learning.paper.infrastructure.PaperQuestionRepository;
import com.aiexam.learning.paper.infrastructure.PaperRepository;
import com.aiexam.learning.question.domain.ContentStatus;
import com.aiexam.learning.question.domain.Question;
import com.aiexam.learning.question.domain.QuestionService;
import com.aiexam.learning.question.domain.QuestionType;
import com.aiexam.learning.question.infrastructure.QuestionRepository;
import com.aiexam.learning.user.domain.User;
import com.aiexam.learning.user.infrastructure.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PaperService {

    private final PaperRepository paperRepository;
    private final PaperQuestionRepository paperQuestionRepository;
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
        PaperSection section = request.section();
        int min = request.targetEloMin() == null ? PaperGenerateRules.defaultEloMin(section) : request.targetEloMin();
        int max = request.targetEloMax() == null ? PaperGenerateRules.defaultEloMax(section) : request.targetEloMax();
        if (min > max) {
            throw new BusinessRuleException("INVALID_ELO_RANGE", "targetEloMin must be <= targetEloMax");
        }
        String sectionTitle = PaperGenerateRules.sectionTitle(section);
        String title = request.title() == null || request.title().isBlank()
                ? "Đề " + sectionTitle + " tự động"
                : request.title();
        int duration = PaperGenerateRules.durationMinutes(section, request.questionCount());
        User author = user(authorId);
        Subject subject = catalogService.getSubject(request.subjectId());
        Paper paper = newPracticePaper(author, subject, title, sectionTitle, min, max, duration);
        if (section == PaperSection.PART_II) {
            addPartTwoGroups(paper, request.subjectId(), min, max, request.questionCount(), sectionTitle);
        } else {
            addShuffledQuestions(paper, request.subjectId(), section, min, max, request.questionCount(), sectionTitle);
        }
        return PaperResponse.from(paperRepository.save(paper), true);
    }

    private Paper newPracticePaper(
            User author,
            Subject subject,
            String title,
            String sectionTitle,
            int min,
            int max,
            int duration
    ) {
        return Paper.create(
                author,
                subject,
                title,
                "Generated " + sectionTitle + " from Elo " + min + "-" + max,
                PaperKind.PRACTICE,
                PaperSource.MANUAL,
                duration,
                min,
                max,
                ContentStatus.PUBLISHED
        );
    }

    private void addShuffledQuestions(
            Paper paper,
            UUID subjectId,
            PaperSection section,
            int min,
            int max,
            int questionCount,
            String sectionTitle
    ) {
        QuestionType type = PaperGenerateRules.questionType(section);
        List<Question> pool = questionRepository.findPublishedInEloRangeAndType(
                subjectId, ContentStatus.PUBLISHED, type, min, max);
        if (pool.size() < questionCount) {
            throw new BusinessRuleException(
                    "NOT_ENOUGH_QUESTIONS",
                    "Not enough published " + type.name().toLowerCase() + " questions in Elo range " + min + "-" + max
            );
        }
        Collections.shuffle(pool);
        int order = 1;
        for (Question question : pool.subList(0, questionCount)) {
            paper.addQuestion(
                    question,
                    order,
                    PaperGenerateRules.points(section),
                    section,
                    sectionTitle,
                    String.valueOf(order),
                    null
            );
            order++;
        }
    }

    private void addPartTwoGroups(
            Paper paper,
            UUID subjectId,
            int min,
            int max,
            int groupCount,
            String sectionTitle
    ) {
        List<PaperQuestion> rows = paperQuestionRepository.findGroupedSectionItems(
                subjectId, PaperSection.PART_II, ContentStatus.PUBLISHED, min, max);
        Map<UUID, Question> questions = new LinkedHashMap<>();
        for (PaperQuestion row : rows) {
            questions.putIfAbsent(row.getQuestion().getId(), row.getQuestion());
        }
        List<List<PaperGenerateRules.SourceItem>> groups = PaperGenerateRules.completePartTwoGroups(
                rows.stream()
                        .map(row -> new PaperGenerateRules.SourceItem(
                                row.getPaper().getId(),
                                row.getGroupKey(),
                                row.getQuestion().getId(),
                                row.getSortOrder()))
                        .toList()
        );
        if (groups.size() < groupCount) {
            throw new BusinessRuleException(
                    "NOT_ENOUGH_QUESTIONS",
                    "Not enough Phần II groups (4 ý a–d) in Elo range " + min + "-" + max
            );
        }
        Collections.shuffle(groups);
        int order = 1;
        int groupNumber = 1;
        for (List<PaperGenerateRules.SourceItem> group : groups.subList(0, groupCount)) {
            String groupKey = PaperGenerateRules.partTwoGroupKey(groupNumber);
            int index = 0;
            for (PaperGenerateRules.SourceItem item : group) {
                paper.addQuestion(
                        questions.get(item.questionId()),
                        order++,
                        PaperGenerateRules.points(PaperSection.PART_II),
                        PaperSection.PART_II,
                        sectionTitle,
                        PaperGenerateRules.partTwoItemLabel(groupNumber, index),
                        groupKey
                );
                index++;
            }
            groupNumber++;
        }
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
