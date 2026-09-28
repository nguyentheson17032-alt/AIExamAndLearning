package com.aiexam.learning.paper.domain;

import com.aiexam.learning.catalog.domain.CatalogService;
import com.aiexam.learning.catalog.domain.Subject;
import com.aiexam.learning.classroom.domain.ClassroomAccess;
import com.aiexam.learning.classroom.domain.ClassroomService;
import com.aiexam.learning.classroom.infrastructure.ClassroomMemberRepository;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Random;
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
    private final ClassroomService classroomService;
    private final ClassroomAccess classroomAccess;
    private final ClassroomMemberRepository classroomMemberRepository;

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
        Paper saved = paperRepository.save(paper);
        if (request.classroomId() != null) {
            classroomService.share(authorId, request.classroomId(), saved.getId());
        }
        return PaperResponse.from(saved, true);
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

    @Transactional
    public PaperResponse generateBankPractice(
            UUID authorId,
            UUID subjectId,
            String title,
            String description,
            int questionCount,
            int duration,
            int preferredMin,
            int preferredMax
    ) {
        if (preferredMin > preferredMax) {
            throw new BusinessRuleException("INVALID_ELO_RANGE", "targetEloMin must be <= targetEloMax");
        }
        User author = user(authorId);
        Subject subject = catalogService.getSubject(subjectId);
        List<BankPracticePicker.Unit> picked = pickBankUnits(subjectId, questionCount, preferredMin, preferredMax);
        if (picked.isEmpty()) {
            throw new BusinessRuleException(
                    "NO_PRACTICE_QUESTIONS",
                    "Not enough published bank questions. True/false items need a complete group of 4 ý a–d."
            );
        }
        Paper paper = Paper.create(
                author,
                subject,
                title,
                description,
                PaperKind.PRACTICE,
                PaperSource.AI_GENERATED,
                duration,
                preferredMin,
                preferredMax,
                ContentStatus.PUBLISHED
        );
        addBankUnits(paper, picked);
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

    public PaperResponse getForReader(User reader, UUID id, boolean includeAnswer) {
        Paper paper = getPaper(id);
        classroomAccess.requireCanRead(reader, paper);
        return PaperResponse.from(paper, includeAnswer);
    }

    public Paper getPaper(UUID id) {
        return paperRepository.findWithItemsById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PAPER_NOT_FOUND", "Paper not found: " + id));
    }

    public PageResponse<PaperResponse> list(User viewer, UUID subjectId, PaperKind kind, ContentStatus status, Pageable pageable) {
        ContentStatus filter = status == null ? ContentStatus.PUBLISHED : status;
        Page<Paper> page = switch (viewer.getRole()) {
            case STUDENT -> sharedWithStudent(viewer.getId(), subjectId, kind, filter, pageable);
            case TEACHER -> visibleToTeacher(viewer.getId(), subjectId, kind, filter, pageable);
            case ADMIN -> allPublished(subjectId, kind, filter, pageable);
        };
        return PageResponse.from(page.map(paper -> PaperResponse.from(paper, false)));
    }

    private Page<Paper> sharedWithStudent(UUID studentId, UUID subjectId, PaperKind kind, ContentStatus status, Pageable pageable) {
        if (!classroomMemberRepository.existsByStudent_Id(studentId)) {
            return Page.empty(pageable);
        }
        if (kind != null) {
            return paperRepository.findSharedWithStudentByKindAndStatus(studentId, kind, status, pageable);
        }
        if (subjectId != null) {
            return paperRepository.findSharedWithStudentBySubjectIdAndStatus(studentId, subjectId, status, pageable);
        }
        return paperRepository.findSharedWithStudentByStatus(studentId, status, pageable);
    }

    private Page<Paper> visibleToTeacher(UUID teacherId, UUID subjectId, PaperKind kind, ContentStatus status, Pageable pageable) {
        if (kind != null) {
            return paperRepository.findVisibleToTeacherByKindAndStatus(teacherId, kind, status, pageable);
        }
        if (subjectId != null) {
            return paperRepository.findVisibleToTeacherBySubjectIdAndStatus(teacherId, subjectId, status, pageable);
        }
        return paperRepository.findVisibleToTeacherByStatus(teacherId, status, pageable);
    }

    private Page<Paper> allPublished(UUID subjectId, PaperKind kind, ContentStatus status, Pageable pageable) {
        if (kind != null) {
            return paperRepository.findByKindAndStatus(kind, status, pageable);
        }
        if (subjectId != null) {
            return paperRepository.findBySubjectIdAndStatus(subjectId, status, pageable);
        }
        return paperRepository.findByStatus(status, pageable);
    }

    private List<BankPracticePicker.Unit> pickBankUnits(UUID subjectId, int questionCount, int preferredMin, int preferredMax) {
        List<BankPracticePicker.Unit> picked = BankPracticePicker.pick(
                bankUnitPool(subjectId, preferredMin, preferredMax),
                questionCount,
                new Random()
        );
        if (!picked.isEmpty() || (preferredMin == 100 && preferredMax == 3000)) {
            return picked;
        }
        return BankPracticePicker.pick(bankUnitPool(subjectId, 100, 3000), questionCount, new Random());
    }

    private List<BankPracticePicker.Unit> bankUnitPool(UUID subjectId, int min, int max) {
        List<UUID> multipleChoice = questionRepository.findPublishedInEloRangeAndType(
                        subjectId, ContentStatus.PUBLISHED, QuestionType.MULTIPLE_CHOICE, min, max)
                .stream()
                .map(Question::getId)
                .toList();
        List<UUID> shortAnswer = questionRepository.findPublishedInEloRangeAndType(
                        subjectId, ContentStatus.PUBLISHED, QuestionType.SHORT_ANSWER, min, max)
                .stream()
                .map(Question::getId)
                .toList();
        List<PaperQuestion> rows = paperQuestionRepository.findGroupedSectionItems(
                subjectId, PaperSection.PART_II, ContentStatus.PUBLISHED, min, max);
        List<List<UUID>> trueFalseGroups = PaperGenerateRules.completePartTwoGroups(
                rows.stream()
                        .map(row -> new PaperGenerateRules.SourceItem(
                                row.getPaper().getId(),
                                row.getGroupKey(),
                                row.getQuestion().getId(),
                                row.getSortOrder()))
                        .toList()
        ).stream()
                .map(group -> group.stream().map(PaperGenerateRules.SourceItem::questionId).toList())
                .toList();
        return BankPracticePicker.pool(multipleChoice, shortAnswer, trueFalseGroups);
    }

    private void addBankUnits(Paper paper, List<BankPracticePicker.Unit> units) {
        LinkedHashSet<UUID> ids = new LinkedHashSet<>();
        for (BankPracticePicker.Unit unit : units) {
            switch (unit) {
                case BankPracticePicker.Single single -> ids.add(single.questionId());
                case BankPracticePicker.TrueFalseGroup group -> ids.addAll(group.questionIds());
            }
        }
        Map<UUID, Question> questions = new LinkedHashMap<>();
        for (UUID id : ids) {
            questions.put(id, questionService.getQuestion(id));
        }
        int order = 1;
        int partOne = 1;
        int partTwo = 1;
        int partThree = 1;
        for (BankPracticePicker.Unit unit : BankPracticePicker.orderBySection(units)) {
            switch (unit) {
                case BankPracticePicker.Single single -> {
                    PaperSection section = single.section();
                    boolean partOneItem = section == PaperSection.PART_I;
                    String label = partOneItem
                            ? PaperGenerateRules.partOneItemLabel(partOne++)
                            : PaperGenerateRules.partThreeItemLabel(partThree++);
                    paper.addQuestion(
                            questions.get(single.questionId()),
                            order++,
                            PaperGenerateRules.points(section),
                            section,
                            PaperGenerateRules.sectionTitle(section),
                            label,
                            label
                    );
                }
                case BankPracticePicker.TrueFalseGroup group -> {
                    String groupKey = PaperGenerateRules.partTwoGroupKey(partTwo);
                    int index = 0;
                    for (UUID questionId : group.questionIds()) {
                        paper.addQuestion(
                                questions.get(questionId),
                                order++,
                                PaperGenerateRules.points(PaperSection.PART_II),
                                PaperSection.PART_II,
                                PaperGenerateRules.sectionTitle(PaperSection.PART_II),
                                PaperGenerateRules.partTwoItemLabel(partTwo, index),
                                groupKey
                        );
                        index++;
                    }
                    partTwo++;
                }
            }
        }
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
            paper.addQuestion(
                    question,
                    order++,
                    item.points(),
                    item.section(),
                    item.sectionTitle(),
                    item.itemLabel(),
                    item.groupKey()
            );
        }
    }

    private User user(UUID authorId) {
        return userRepository.findById(authorId)
                .orElseThrow(() -> new ResourceNotFoundException("USER_NOT_FOUND", "User not found: " + authorId));
    }
}
