package com.aiexam.learning.ai.domain;

import com.aiexam.learning.ai.infrastructure.AiGenerationJobRepository;
import com.aiexam.learning.attempt.domain.Attempt;
import com.aiexam.learning.attempt.domain.AttemptService;
import com.aiexam.learning.common.exception.BusinessRuleException;
import com.aiexam.learning.elo.domain.EloService;
import com.aiexam.learning.paper.domain.Paper;
import com.aiexam.learning.paper.domain.PaperSet;
import com.aiexam.learning.paper.domain.PaperService;
import com.aiexam.learning.question.domain.QuestionService;
import com.aiexam.learning.question.infrastructure.QuestionClassificationRepository;
import com.aiexam.learning.question.infrastructure.QuestionRepository;
import com.aiexam.learning.user.domain.User;
import com.aiexam.learning.user.infrastructure.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AiExamServiceTest {

    @Mock
    private ExamAiClient examAiClient;
    @Mock
    private QuestionService questionService;
    @Mock
    private QuestionRepository questionRepository;
    @Mock
    private QuestionClassificationRepository classificationRepository;
    @Mock
    private PaperService paperService;
    @Mock
    private AttemptService attemptService;
    @Mock
    private EloService eloService;
    @Mock
    private UserRepository userRepository;
    @Mock
    private AiGenerationJobRepository jobRepository;
    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private AiExamService aiExamService;

    @Test
    void adjustElo_whenExamSetPaper_throwsLockedToScore() {
        UUID userId = UUID.randomUUID();
        UUID attemptId = UUID.randomUUID();
        User user = mock(User.class);
        Attempt attempt = mock(Attempt.class);
        Paper paper = mock(Paper.class);
        when(user.getId()).thenReturn(userId);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(attemptService.getAttempt(attemptId)).thenReturn(attempt);
        when(attempt.getUser()).thenReturn(user);
        when(attempt.getPaper()).thenReturn(paper);
        when(paper.getPaperSet()).thenReturn(mock(PaperSet.class));

        assertThatThrownBy(() -> aiExamService.adjustElo(userId, attemptId))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Exam-set Elo");
        verifyNoInteractions(eloService, examAiClient, jobRepository);
    }
}
