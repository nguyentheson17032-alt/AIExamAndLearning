package com.aiexam.learning.question.domain;

import com.aiexam.learning.catalog.domain.CatalogService;
import com.aiexam.learning.catalog.domain.Subject;
import com.aiexam.learning.catalog.domain.Topic;
import com.aiexam.learning.common.api.PageResponse;
import com.aiexam.learning.common.exception.BusinessRuleException;
import com.aiexam.learning.common.exception.ResourceNotFoundException;
import com.aiexam.learning.paper.infrastructure.PaperQuestionRepository;
import com.aiexam.learning.question.api.ChoiceRequest;
import com.aiexam.learning.question.api.QuestionCreateRequest;
import com.aiexam.learning.question.api.QuestionResponse;
import com.aiexam.learning.question.api.QuestionUpdateRequest;
import com.aiexam.learning.question.infrastructure.QuestionRepository;
import com.aiexam.learning.user.domain.User;
import com.aiexam.learning.user.infrastructure.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final PaperQuestionRepository paperQuestionRepository;
    private final CatalogService catalogService;
    private final UserRepository userRepository;

    @Transactional
    public QuestionResponse create(UUID authorId, QuestionCreateRequest request) {
        return QuestionResponse.from(saveQuestion(authorId, request, null));
    }

    @Transactional
    public List<QuestionResponse> upload(UUID authorId, List<QuestionCreateRequest> requests) {
        List<QuestionResponse> saved = new ArrayList<>();
        for (QuestionCreateRequest request : requests) {
            saved.add(QuestionResponse.from(saveQuestion(authorId, request, null)));
        }
        return saved;
    }

    @Transactional
    public Question saveGenerated(UUID authorId, QuestionCreateRequest request, Question similarTo) {
        return saveQuestion(authorId, request, similarTo);
    }

    @Transactional
    public QuestionResponse update(UUID id, QuestionUpdateRequest request) {
        Question question = getQuestion(id);
        question.updateContent(
                request.stem(),
                request.answerKey(),
                request.explanation(),
                request.difficulty(),
                request.eloRating(),
                request.bloomLevel(),
                request.status()
        );
        if (request.choices() != null) {
            validateChoices(question.getType(), request.choices());
            List<QuestionChoice> choices = new ArrayList<>();
            for (int i = 0; i < request.choices().size(); i++) {
                ChoiceRequest choice = request.choices().get(i);
                choices.add(QuestionChoice.create(question, choice.label(), choice.content(), choice.correct(), i + 1));
            }
            question.replaceChoices(choices);
        }
        return QuestionResponse.from(question);
    }

    public QuestionResponse get(UUID id, boolean includeAnswer) {
        return QuestionResponse.from(getQuestion(id), includeAnswer);
    }

    public Question getQuestion(UUID id) {
        return questionRepository.findWithChoicesById(id)
                .orElseThrow(() -> new ResourceNotFoundException("QUESTION_NOT_FOUND", "Question not found: " + id));
    }

    public PageResponse<QuestionResponse> list(UUID subjectId, ContentStatus status, boolean includeAnswer, Pageable pageable) {
        ContentStatus filter = status == null ? ContentStatus.PUBLISHED : status;
        var page = subjectId == null
                ? questionRepository.findByStatus(filter, pageable)
                : questionRepository.findBySubjectIdAndStatus(subjectId, filter, pageable);
        return PageResponse.from(page.map(question -> QuestionResponse.from(question, includeAnswer)));
    }

    @Transactional
    public void archive(UUID id) {
        if (paperQuestionRepository.existsByQuestionId(id)) {
            throw new BusinessRuleException("QUESTION_IN_USE", "Question is used in a paper and cannot be archived");
        }
        getQuestion(id).archive();
    }

    private Question saveQuestion(UUID authorId, QuestionCreateRequest request, Question similarTo) {
        validateChoices(request.type(), request.choices());
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new ResourceNotFoundException("USER_NOT_FOUND", "User not found: " + authorId));
        Subject subject = catalogService.getSubject(request.subjectId());
        Topic topic = request.topicId() == null ? null : catalogService.getTopic(request.topicId());
        if (topic != null && !topic.getSubject().getId().equals(subject.getId())) {
            throw new BusinessRuleException("TOPIC_SUBJECT_MISMATCH", "Topic does not belong to the subject");
        }
        QuestionSource source = request.source() == null ? QuestionSource.MANUAL : request.source();
        ContentStatus status = request.status() == null ? ContentStatus.PUBLISHED : request.status();
        Question question = Question.create(
                author,
                subject,
                topic,
                request.type(),
                request.stem(),
                request.answerKey(),
                request.explanation(),
                request.difficulty(),
                request.eloRating(),
                request.bloomLevel(),
                source,
                status,
                similarTo
        );
        if (request.choices() != null) {
            for (int i = 0; i < request.choices().size(); i++) {
                ChoiceRequest choice = request.choices().get(i);
                question.addChoice(choice.label(), choice.content(), choice.correct(), i + 1);
            }
        }
        return questionRepository.save(question);
    }

    private void validateChoices(QuestionType type, List<ChoiceRequest> choices) {
        boolean needsChoices = type == QuestionType.MULTIPLE_CHOICE || type == QuestionType.TRUE_FALSE;
        if (!needsChoices) {
            return;
        }
        if (choices == null || choices.size() < 2) {
            throw new BusinessRuleException("CHOICES_REQUIRED", "Objective questions need at least two choices");
        }
        boolean hasCorrect = choices.stream().anyMatch(ChoiceRequest::correct);
        if (!hasCorrect) {
            throw new BusinessRuleException("CORRECT_CHOICE_REQUIRED", "At least one choice must be correct");
        }
    }
}
