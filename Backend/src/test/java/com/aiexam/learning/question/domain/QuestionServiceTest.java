package com.aiexam.learning.question.domain;

import com.aiexam.learning.catalog.domain.CatalogService;
import com.aiexam.learning.catalog.domain.Subject;
import com.aiexam.learning.common.exception.BusinessRuleException;
import com.aiexam.learning.paper.infrastructure.PaperQuestionRepository;
import com.aiexam.learning.question.api.ChoiceRequest;
import com.aiexam.learning.question.api.QuestionCreateRequest;
import com.aiexam.learning.question.infrastructure.QuestionRepository;
import com.aiexam.learning.user.domain.User;
import com.aiexam.learning.user.domain.UserRole;
import com.aiexam.learning.user.infrastructure.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class QuestionServiceTest {

    @Mock
    private QuestionRepository questionRepository;
    @Mock
    private PaperQuestionRepository paperQuestionRepository;
    @Mock
    private CatalogService catalogService;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private QuestionService questionService;

    @Test
    void create_whenMcqMissingCorrectChoice_throwsBusinessRule() {
        var request = new QuestionCreateRequest(
                UUID.randomUUID(),
                null,
                QuestionType.MULTIPLE_CHOICE,
                "2+2?",
                "4",
                null,
                Difficulty.BEGINNER,
                900,
                null,
                QuestionSource.MANUAL,
                ContentStatus.PUBLISHED,
                List.of(new ChoiceRequest("A", "3", false), new ChoiceRequest("B", "5", false))
        );

        assertThatThrownBy(() -> questionService.create(UUID.randomUUID(), request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("correct");
    }

    @Test
    void create_whenValidMcq_savesQuestion() {
        UUID authorId = UUID.randomUUID();
        UUID subjectId = UUID.randomUUID();
        User author = User.register("teacher@exam.local", "hash", "Teacher", UserRole.TEACHER, 1200);
        Subject subject = Subject.create("MATH", "Toán", null);
        when(userRepository.findById(authorId)).thenReturn(Optional.of(author));
        when(catalogService.getSubject(subjectId)).thenReturn(subject);
        when(questionRepository.save(any(Question.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var request = new QuestionCreateRequest(
                subjectId,
                null,
                QuestionType.MULTIPLE_CHOICE,
                "2+2?",
                "4",
                null,
                Difficulty.BEGINNER,
                900,
                null,
                QuestionSource.UPLOAD,
                ContentStatus.PUBLISHED,
                List.of(new ChoiceRequest("A", "3", false), new ChoiceRequest("B", "4", true))
        );

        questionService.create(authorId, request);
        verify(questionRepository).save(any(Question.class));
    }
}
