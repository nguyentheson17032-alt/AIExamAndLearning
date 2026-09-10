package com.aiexam.learning.attempt.domain;

import com.aiexam.learning.question.domain.Question;
import com.aiexam.learning.question.domain.QuestionChoice;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "attempt_answers")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AttemptAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "attempt_id", nullable = false)
    private Attempt attempt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "selected_choice_id")
    private QuestionChoice selectedChoice;

    @Column(name = "text_answer")
    private String textAnswer;

    private Boolean correct;

    @Column(precision = 8, scale = 2)
    private BigDecimal score;

    @Column(name = "ai_feedback")
    private String aiFeedback;

    @Enumerated(EnumType.STRING)
    @Column(name = "graded_by")
    private GradedBy gradedBy;

    public static AttemptAnswer create(Attempt attempt, Question question, QuestionChoice selectedChoice, String textAnswer) {
        AttemptAnswer answer = new AttemptAnswer();
        answer.attempt = attempt;
        answer.question = question;
        answer.selectedChoice = selectedChoice;
        answer.textAnswer = textAnswer;
        return answer;
    }

    public void grade(boolean correct, BigDecimal score, String aiFeedback, GradedBy gradedBy) {
        this.correct = correct;
        this.score = score;
        this.aiFeedback = aiFeedback;
        this.gradedBy = gradedBy;
    }
}
