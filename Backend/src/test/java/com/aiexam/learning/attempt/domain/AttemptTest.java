package com.aiexam.learning.attempt.domain;

import com.aiexam.learning.catalog.domain.Subject;
import com.aiexam.learning.paper.domain.Paper;
import com.aiexam.learning.paper.domain.PaperKind;
import com.aiexam.learning.paper.domain.PaperSource;
import com.aiexam.learning.question.domain.ContentStatus;
import com.aiexam.learning.question.domain.Difficulty;
import com.aiexam.learning.question.domain.Question;
import com.aiexam.learning.question.domain.QuestionSource;
import com.aiexam.learning.question.domain.QuestionType;
import com.aiexam.learning.user.domain.User;
import com.aiexam.learning.user.domain.UserRole;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class AttemptTest {

    @Test
    void start_setsInProgressAndMaxScore() {
        User user = User.register("student@exam.local", "hash", "Student", UserRole.STUDENT, 1000);
        User teacher = User.register("teacher@exam.local", "hash", "Teacher", UserRole.TEACHER, 1200);
        Subject subject = Subject.create("MATH", "Toán", null);
        Paper paper = Paper.create(
                teacher, subject, "Quiz", null, PaperKind.EXAM, PaperSource.MANUAL,
                30, 800, 1200, ContentStatus.PUBLISHED);
        Question question = Question.create(
                teacher, subject, null, QuestionType.MULTIPLE_CHOICE, "2+2?", "4", null,
                Difficulty.BEGINNER, 900, null, QuestionSource.MANUAL, ContentStatus.PUBLISHED, null);
        paper.addQuestion(question, 1, BigDecimal.TEN);

        Attempt attempt = Attempt.start(user, paper);

        assertThat(attempt.getStatus()).isEqualTo(AttemptStatus.IN_PROGRESS);
        assertThat(attempt.getMaxScore()).isEqualByComparingTo("10");
    }
}
